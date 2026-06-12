export const dynamic = 'force-dynamic';

import { subscribe, getCount } from "@/lib/subscribers-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP } from "@/lib/logger";

/** POST /api/subscribe — Public: subscribe to newsletter */
export async function POST(request) {
  const ip = getClientIP(request);

  const rl = checkRateLimit(ip, "submission");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const { email, source, _hp_field } = body;

    // Honeypot check
    if (_hp_field) {
      logger.warn("HONEYPOT_TRIGGERED", { ip, path: "/api/subscribe" });
      return Response.json({ success: true }, { headers: rl.headers }); // Silent success
    }

    const result = subscribe(email, source || "homepage");

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400, headers: rl.headers });
    }

    if (result.alreadyExists) {
      return Response.json(
        { success: true, message: "You're already subscribed!", alreadyExists: true },
        { status: 200, headers: rl.headers }
      );
    }

    return Response.json(
      { success: true, message: "Successfully subscribed!" },
      { status: 201, headers: rl.headers }
    );
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "POST", path: "/api/subscribe", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

/** GET /api/subscribe — Public: get subscriber count */
export async function GET() {
  try {
    const count = getCount();
    return Response.json({ count });
  } catch {
    return Response.json({ count: 0 });
  }
}
