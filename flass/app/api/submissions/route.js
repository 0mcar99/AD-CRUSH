export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/session";
import { getAll, getCounts, add } from "@/lib/submissions-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP } from "@/lib/logger";

/** GET /api/submissions — Admin only: list all + counts */
export async function GET(request) {
  const ip = getClientIP(request);

  const session = await getSession();
  if (!session) {
    logger.warn("API_ERROR_401", { ip, method: "GET", path: "/api/submissions" });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, "admin");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    let submissions = await getAll();
    if (session.role !== "admin") {
      const userEmail = (session.email || "").toLowerCase();
      submissions = submissions.filter((s) => (s.email || "").toLowerCase() === userEmail);
    }
    const counts = getCounts();
    return Response.json({ submissions, counts }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "GET", path: "/api/submissions", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

/** POST /api/submissions — Public: create submission */
export async function POST(request) {
  const ip = getClientIP(request);

  const rl = checkRateLimit(ip, "submission");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();

    // Honeypot check — bots fill hidden fields
    if (body._hp_field) {
      logger.warn("HONEYPOT_TRIGGERED", { ip });
      return Response.json({ success: true }, { headers: rl.headers }); // Silent success
    }

    // Timing validation — reject if form completed too fast (<5s) or timestamp is invalid
    if (body._formStartedAt) {
      const elapsed = Date.now() - body._formStartedAt;
      if (elapsed < 5000 && elapsed >= 0) {
        logger.warn("TIMING_VIOLATION", { ip, elapsed });
        return Response.json({ error: "Please take your time filling the form." }, { status: 400, headers: rl.headers });
      }
    }

    // Remove meta fields before storing
    const { _hp_field, _formStartedAt, ...submissionData } = body;

    const result = add(submissionData);
    if (result.errors) {
      return Response.json({ error: "Validation failed", fields: result.errors }, { status: 400, headers: rl.headers });
    }

    return Response.json({ success: true, id: result.entry.id }, { status: 201, headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "POST", path: "/api/submissions", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
