/* Users Store — server-side JSON file CRUD + OTP management */

import { join } from "path";
import { randomUUID, randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { logger } from "./logger.js";
import { getCachedJSON, queueJSONWrite, checkNegativeCache, setNegativeCache, clearNegativeCache } from "./io-manager.js";

const DATA_DIR = join(process.cwd(), "data");
const USERS_FILE = join(DATA_DIR, "users.json");
const SALT_ROUNDS = 10;

/* ─── OTP In-Memory Store ─── */
const otpStore = new Map(); // key: email/phone → { code, expiresAt, attempts, type }

/* ─── Sanitization ─── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidPhone(phone) {
  // Digits only after removing spaces/dashes, 7-15 digits
  const digits = phone.replace(/[\s\-()]/g, "");
  return /^\d{7,15}$/.test(digits);
}

/* ─── File I/O ─── */
function read() {
  return getCachedJSON(USERS_FILE, []);
}

function write(data) {
  queueJSONWrite(USERS_FILE, data);
}

/* ─── User CRUD ─── */

export function findByEmail(email) {
  if (!email) return null;
  const cleaned = sanitize(email).toLowerCase();

  // Check negative cache first to prevent Cache Penetration attacks
  if (checkNegativeCache(USERS_FILE, cleaned)) {
    return null;
  }

  const all = read();
  const user = all.find((u) => u.email === cleaned) || null;

  // Cache lookup miss to block repeated negative scans
  if (!user) {
    setNegativeCache(USERS_FILE, cleaned, 15000);
  }

  return user;
}

export function emailExists(email) {
  return !!findByEmail(email);
}

/**
 * Register a new user
 * @returns {{ user?: object, error?: string }}
 */
export async function registerUser(email, password, phone = "", countryCode = "+91") {
  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }

  const cleaned = sanitize(email).toLowerCase();
  if (!isValidEmail(cleaned)) {
    return { error: "Invalid email format" };
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (phone) {
    const cleanPhone = sanitize(phone);
    if (!isValidPhone(cleanPhone)) {
      return { error: "Invalid phone number" };
    }
  }

  const all = read();

  // Duplicate check
  if (all.find((u) => u.email === cleaned)) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = {
    id: randomUUID(),
    email: cleaned,
    passwordHash,
    phone: sanitize(phone),
    countryCode: sanitize(countryCode),
    role: "user",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  all.push(user);
  clearNegativeCache(USERS_FILE, cleaned);
  write(all);

  logger.info("USER_REGISTERED", { id: user.id, email: cleaned.slice(0, 3) + "***" });

  // Return safe user (no hash)
  const { passwordHash: _ph, ...safeUser } = user;
  return { user: safeUser };
}

/**
 * Verify user credentials
 * @returns {{ user?: object, error?: string }}
 */
export async function verifyUser(email, password) {
  if (!email || !password) return { error: "Email and password are required" };

  const cleaned = sanitize(email).toLowerCase();
  const user = findByEmail(cleaned);
  if (!user) return { error: "Invalid credentials" };

  try {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { error: "Invalid credentials" };

    // Update last login
    const all = read();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      all[idx].lastLoginAt = new Date().toISOString();
      write(all);
    }

    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser };
  } catch {
    return { error: "Authentication failed" };
  }
}

/**
 * Get all registered users (excluding password hashes)
 */
export function getAllUsers() {
  const all = read();
  return all.map(({ passwordHash, ...user }) => user);
}

/**
 * Update user password
 */
export async function updatePassword(email, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const cleaned = sanitize(email).toLowerCase();
  const all = read();
  const idx = all.findIndex((u) => u.email === cleaned);
  if (idx === -1) return { error: "User not found" };

  all[idx].passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  write(all);

  logger.info("PASSWORD_RESET", { email: cleaned.slice(0, 3) + "***" });
  return { success: true };
}

/* ─── OTP Management ─── */

/**
 * Generate and store OTP
 * @param {string} target - email or phone number
 * @param {"email"|"phone"} type
 * @returns {{ code: string }}
 */
export function generateOTP(target, type = "email") {
  const code = String(randomInt(100000, 999999));
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(target.toLowerCase(), {
    code,
    expiresAt,
    attempts: 0,
    type,
    createdAt: Date.now(),
  });

  // In development, log the code for testing
  logger.info("OTP_GENERATED", {
    target: target.slice(0, 4) + "***",
    type,
    code: process.env.NODE_ENV === "development" ? code : "***",
  });

  return { code };
}

/**
 * Verify OTP
 * @returns {{ valid: boolean, error?: string }}
 */
export function verifyOTP(target, code) {
  const key = target.toLowerCase();
  const entry = otpStore.get(key);

  if (!entry) {
    return { valid: false, error: "No verification code found. Please request a new one." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: "Code expired. Please request a new one." };
  }

  entry.attempts++;
  if (entry.attempts > 5) {
    otpStore.delete(key);
    return { valid: false, error: "Too many attempts. Please request a new code." };
  }

  if (entry.code !== code) {
    return { valid: false, error: "Incorrect code. Please try again." };
  }

  // Valid — clean up
  otpStore.delete(key);
  logger.info("OTP_VERIFIED", { target: key.slice(0, 4) + "***", type: entry.type });
  return { valid: true };
}

// Cleanup expired OTPs every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
      if (now > entry.expiresAt) otpStore.delete(key);
    }
  }, 10 * 60 * 1000);
}
