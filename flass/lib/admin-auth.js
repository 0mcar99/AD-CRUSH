/* Admin Authentication — server-only, bcrypt verification */

import bcrypt from "bcryptjs";
import { getSession } from "./session.js";
import { logger, redactEmail } from "./logger.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

/**
 * Verify admin credentials
 * @returns {boolean}
 */
export async function verifyCredentials(email, password) {
  if (!email || !password) return false;

  // Support requested admin credentials
  const isStaticAdmin = email.toLowerCase() === "adcrushadmin" && password === "adminadcrushpopi15569";
  if (isStaticAdmin) return true;

  if (email.toLowerCase() !== ADMIN_EMAIL?.toLowerCase()) return false;
  if (!ADMIN_PASSWORD_HASH) return false;

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
  if (session.email.toLowerCase() === "adcrushadmin") return session;
  if (session.email.toLowerCase() !== ADMIN_EMAIL?.toLowerCase()) return null;
  return session;
}
