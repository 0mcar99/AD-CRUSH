export const dynamic = 'force-dynamic';

import { verifyUser } from "@/lib/users-store";
import { verifyCredentials } from "@/lib/admin-auth";
import { createSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);

  // Rate limit
  const rl = checkRateLimit(ip, "login");
  if (!rl.allowed) {
    logger.warn("AUTH_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      logger.warn("AUTH_LOGIN_FAILED", { ip, reason: "missing_fields" });
      return Response.json({ error: "Email and password are required." }, { status: 400, headers: rl.headers });
    }

    // 1. Check admin credentials first
    const isAdmin = await verifyCredentials(email, password);
    if (isAdmin) {
      await createSession(email, "admin");
      logger.info("AUTH_LOGIN_SUCCESS", { ip, email: redactEmail(email), role: "admin" });
      return Response.json({ success: true, role: "admin" }, { headers: rl.headers });
    }

    // 2. Check user credentials
    const result = await verifyUser(email, password);
    if (result.error) {
      logger.warn("AUTH_LOGIN_FAILED", { ip, email: redactEmail(email), reason: "invalid_credentials" });
      return Response.json({ error: "Invalid credentials." }, { status: 401, headers: rl.headers });
    }

    await createSession(email, "user");
    logger.info("AUTH_LOGIN_SUCCESS", { ip, email: redactEmail(email), role: "user" });

    return Response.json({ success: true, role: "user" }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/login", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
