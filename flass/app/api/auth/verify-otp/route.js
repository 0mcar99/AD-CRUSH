import { verifyOTP, getAllUsers } from "@/lib/users-store";
import { createSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "login");
  if (!rl.allowed) {
    logger.warn("OTP_VERIFY_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();
    const { target, code, action } = body;
    // action: "login" | "reset" — determines what happens after verification

    if (!target || !code || typeof target !== "string" || typeof code !== "string") {
      return Response.json({ error: "Target and code are required." }, { status: 400, headers: rl.headers });
    }

    const result = verifyOTP(target, code);

    if (!result.valid) {
      logger.warn("OTP_VERIFY_FAILED", { ip, target: redactEmail(target), reason: result.error });
      return Response.json({ error: result.error }, { status: 400, headers: rl.headers });
    }

    // If action is "login", create session directly
    if (action === "login") {
      // Resolve the actual email — if target is a phone number, look up the user
      let sessionEmail = target;
      const isPhone = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target);
      if (isPhone) {
        const allUsers = await getAllUsers();
        const phoneDigits = target.replace(/[\s\-()]/g, "");
        const userWithPhone = allUsers.find((u) => {
          const storedDigits = (u.phone || "").replace(/[\s\-()]/g, "");
          return storedDigits.length > 0 && storedDigits === phoneDigits;
        });
        if (!userWithPhone) {
          return Response.json({ error: "Account not found." }, { status: 404, headers: rl.headers });
        }
        sessionEmail = userWithPhone.email;
      }
      await createSession(sessionEmail, "user");
      logger.info("OTP_LOGIN_SUCCESS", { ip, target: redactEmail(target) });
      return Response.json({ success: true, loggedIn: true }, { headers: rl.headers });
    }

    // If action is "reset", return a reset token (the OTP was verified)
    logger.info("OTP_VERIFY_SUCCESS", { ip, target: redactEmail(target), action });
    return Response.json({ success: true, verified: true }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/verify-otp", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
