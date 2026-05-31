/* JWT Session Management — server-only */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Encrypt a payload into a signed JWT
 */
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey);
}

/**
 * Decrypt and verify a JWT token
 * @returns {object|null} payload or null if invalid
 */
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a session and set the httpOnly cookie
 */
export async function createSession(email, role = "user") {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const initial = email ? email.charAt(0).toUpperCase() : "U";
  const session = await encrypt({ email, role, initial, expiresAt: expiresAt.toISOString() });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return session;
}

/**
 * Get the current session from cookies
 * @returns {object|null} session payload or null
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) return null;

  const payload = await decrypt(sessionCookie.value);
  if (!payload) return null;

  // Check expiry
  if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
    return null;
  }

  return payload;
}

/**
 * Delete the session cookie
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
