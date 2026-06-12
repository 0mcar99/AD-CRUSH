export const dynamic = 'force-dynamic';

import { updatePassword } from "@/lib/users-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "login");
  if (!rl.allowed) {
    logger.warn("RESET_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword || typeof email !== "string" || typeof newPassword !== "string") {
      return Response.json({ error: "Email and new password are required." }, { status: 400, headers: rl.headers });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400, headers: rl.headers });
    }

    const result = await updatePassword(email, newPassword);

    if (result.error) {
      logger.warn("PASSWORD_RESET_FAILED", { ip, email: redactEmail(email), reason: result.error });
      return Response.json({ error: result.error }, { status: 400, headers: rl.headers });
    }

    logger.info("PASSWORD_RESET_SUCCESS", { ip, email: redactEmail(email) });
    return Response.json({ success: true, message: "Password updated successfully." }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/reset-password", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
