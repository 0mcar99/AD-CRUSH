/* Admin Authentication — server-only, bcrypt verification */

import bcrypt from "bcryptjs";
import { getSession } from "./session.js";
import { logger, redactEmail } from "./logger.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Warn at startup if admin credentials are not configured in environment
if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.warn("⚠️ WARNING: ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set in environment variables. Admin login will be disabled. Copy .env.example to .env.local and configure your credentials.");
}

/**
 * Verify admin credentials against environment-configured bcrypt hash.
 * Credentials are ONLY accepted from environment variables — never hardcoded.
 * @returns {boolean}
 */
export async function verifyCredentials(email, password) {
  if (!email || !password) return false;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) return false;

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;

  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch {
    return false;
  }
}

/**
 * Require admin session — returns session payload or null
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.email) return null;
  if (!ADMIN_EMAIL) return null;
  if (session.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;
  return session;
}
