export const dynamic = 'force-dynamic';

import { findByEmail, registerUser, updateLastLogin } from "@/lib/users-store";
import { createSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";
import { randomBytes } from "crypto";

export async function POST(request) {
  const ip = getClientIP(request);

  // Rate limit check — uses 'login' tier (150 per 15 min)
  const rl = checkRateLimit(ip, "login");
  if (!rl.allowed) {
    logger.warn("AUTH_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();
    const { email, name, picture } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn("AUTH_GOOGLE_FAILED", { ip, reason: "invalid_or_missing_email" });
      return Response.json({ error: "A valid email is required." }, { status: 400, headers: rl.headers });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // 1. If it's an admin, we don't automatically log them in via mock google OAuth
    // to preserve secure administrative access (or we check if their email matches admin).
    // Let's check admin credentials. Admin accounts should use normal Admin Sign In.
    const allAdmins = ["admin@adcrush.com", "admin"]; // standard admin list or dynamic
    if (cleanedEmail === "admin@adcrush.com") {
      return Response.json({ error: "Please use the official Admin Sign In portal for administrator access." }, { status: 403 });
    }

    // 2. Check if user already exists
    let user = await findByEmail(cleanedEmail);
    let isNewUser = false;

    if (!user) {
      // User doesn't exist - register a new user automatically
      // Generate a secure high-entropy random password for OAuth signup
      const secureRandomPassword = randomBytes(32).toString("hex") + "A1!";
      
      const regResult = await registerUser(cleanedEmail, secureRandomPassword, "", "+91");
      if (regResult.error) {
        logger.error("AUTH_GOOGLE_REGISTRATION_FAILED", { ip, email: redactEmail(cleanedEmail), error: regResult.error });
        return Response.json({ error: regResult.error || "Failed to register Google user." }, { status: 400, headers: rl.headers });
      }
      
      user = regResult.user;
      isNewUser = true;
      logger.info("AUTH_GOOGLE_REGISTER_SUCCESS", { ip, email: redactEmail(cleanedEmail) });
    } else {
      await updateLastLogin(cleanedEmail);
      logger.info("AUTH_GOOGLE_LOGIN_SUCCESS", { ip, email: redactEmail(cleanedEmail) });
    }

    // 3. Establish signed JWT session
    const role = user.role || "user";
    await createSession(cleanedEmail, role);

    return Response.json({
      success: true,
      email: cleanedEmail,
      role: role,
      isNewUser: isNewUser,
      message: isNewUser ? "Successfully registered with Google Account" : "Logged in with Google Account"
    }, { headers: rl.headers });

  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/google", error: err.message });
    return Response.json({ error: "Internal server error during Google Authentication." }, { status: 500 });
  }
}
