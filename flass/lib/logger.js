/* Structured JSON Logger — server-only, zero dependencies */

import { existsSync, mkdirSync, appendFileSync, renameSync, statSync } from "fs";
import { join } from "path";

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "security.log");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROTATIONS = 2;

function ensureDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function rotate() {
  try {
    const stats = statSync(LOG_FILE);
    if (stats.size < MAX_SIZE) return;

    for (let i = MAX_ROTATIONS; i >= 1; i--) {
      const from = i === 1 ? LOG_FILE : `${LOG_FILE}.${i - 1}`;
      const to = `${LOG_FILE}.${i}`;
      if (existsSync(from)) renameSync(from, to);
    }
  } catch {
    // File doesn't exist yet, no rotation needed
  }
}

/** Redact email: "admin@example.com" → "adm***@example.com" */
export function redactEmail(email) {
  if (!email || typeof email !== "string") return "***";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

/** Extract client IP from request */
export function getClientIP(request) {
  if (!request) return "unknown";
  const forwarded = request.headers?.get?.("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers?.get?.("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

/**
 * Write a structured log entry
 * @param {"info"|"warn"|"error"|"critical"} level
 * @param {string} event - Event name like AUTH_LOGIN_FAILED
 * @param {object} data - Additional data
 */
export function log(level, event, data = {}) {
  try {
    ensureDir();
    rotate();

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...data,
    };

    appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n", "utf-8");

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      const prefix = { info: "ℹ️", warn: "⚠️", error: "❌", critical: "🚨" }[level] || "📋";
      console.log(`${prefix} [${event}]`, JSON.stringify(data));
    }
  } catch (err) {
    console.error("Logger error:", err.message);
  }
}

export const logger = {
  info: (event, data) => log("info", event, data),
  warn: (event, data) => log("warn", event, data),
  error: (event, data) => log("error", event, data),
  critical: (event, data) => log("critical", event, data),
};
