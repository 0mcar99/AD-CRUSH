import { registerUser } from "@/lib/users-store";
import { createSession } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "login");
  if (!rl.allowed) {
    logger.warn("REGISTER_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();
    const { email, password, phone, countryCode } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return Response.json({ error: "Email and password are required." }, { status: 400, headers: rl.headers });
    }

    const result = await registerUser(email, password, phone || "", countryCode || "+91");

    if (result.error) {
      logger.warn("REGISTER_FAILED", { ip, email: redactEmail(email), reason: result.error });
      return Response.json({ error: result.error }, { status: 400, headers: rl.headers });
    }

    // Auto-login after registration
    await createSession(email, "user");
    logger.info("REGISTER_SUCCESS", { ip, email: redactEmail(email) });

    return Response.json({ success: true, user: result.user }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/register", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
