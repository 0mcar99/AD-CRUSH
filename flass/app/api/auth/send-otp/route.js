import { generateOTP, emailExists, getAllUsers } from "@/lib/users-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "login");
  if (!rl.allowed) {
    logger.warn("OTP_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();
    const { target, type } = body; // target = email or phone, type = "email" | "phone"

    if (!target || typeof target !== "string" || !target.trim()) {
      return Response.json({ error: "Target is required." }, { status: 400, headers: rl.headers });
    }

    if (type === "email") {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
        return Response.json({ error: "Invalid email format." }, { status: 400, headers: rl.headers });
      }
      // For password reset or email OTP login, the email must exist
      if (!emailExists(target)) {
        return Response.json({ error: "No account found with this email." }, { status: 404, headers: rl.headers });
      }
    }

    if (type === "phone") {
      // Validate that a registered user has this phone number
      const allUsers = getAllUsers();
      const phoneDigits = target.replace(/[\s\-()]/g, "");
      const userWithPhone = allUsers.find((u) => {
        const storedDigits = (u.phone || "").replace(/[\s\-()]/g, "");
        return storedDigits.length > 0 && storedDigits === phoneDigits;
      });
      if (!userWithPhone) {
        // Return generic message to prevent phone enumeration
        return Response.json({ error: "No account found with this phone number." }, { status: 404, headers: rl.headers });
      }
    }

    if (type !== "email" && type !== "phone") {
      return Response.json({ error: "Invalid OTP type." }, { status: 400, headers: rl.headers });
    }

    const { code } = generateOTP(target, type);

    // In dev mode, the code is logged to console by the logger
    // In production, you'd integrate Twilio (phone) or SendGrid (email) here
    logger.info("OTP_SENT", {
      ip,
      target: redactEmail(target),
      type,
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    });

    return Response.json(
      {
        success: true,
        message: type === "email"
          ? "Verification code sent to your email."
          : "Verification code sent to your phone.",
        // In development, include the code for easy testing
        ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
      },
      { headers: rl.headers }
    );
  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/send-otp", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
