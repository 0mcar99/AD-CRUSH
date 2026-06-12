export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/session";
import { getById, updateStatus, updateNotes, remove } from "@/lib/submissions-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

/** GET /api/submissions/[id] — Admin only */
export async function GET(request, { params }) {
  const ip = getClientIP(request);
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(ip, "admin");
  if (!rl.allowed) return rateLimitResponse(rl);

  const { id } = await params;

  // Validate UUID format
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    logger.warn("ANOMALY_SUSPICIOUS_ID", { ip, id });
    return Response.json({ error: "Not found" }, { status: 404, headers: rl.headers });
  }

  const submission = await getById(id);
  if (!submission) {
    return Response.json({ error: "Not found" }, { status: 404, headers: rl.headers });
  }

  return Response.json({ submission }, { headers: rl.headers });
}

/** PATCH /api/submissions/[id] — Admin only: update status or notes */
export async function PATCH(request, { params }) {
  const ip = getClientIP(request);
  const session = await getSession();
  if (!session) {
    logger.warn("API_ERROR_401", { ip, method: "PATCH", path: `/api/submissions/${(await params).id}` });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Require admin role — not just any session
  if (session.role !== "admin") {
    logger.warn("API_ERROR_403", { ip, method: "PATCH", email: session.email });
    return Response.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const rl = checkRateLimit(ip, "admin");
  if (!rl.allowed) return rateLimitResponse(rl);

  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: "Not found" }, { status: 404, headers: rl.headers });
  }

  try {
    const body = await request.json();
    let updated = null;

    if (body.status !== undefined) {
      updated = updateStatus(id, body.status);
      if (!updated) {
        return Response.json({ error: "Not found or invalid status" }, { status: 404, headers: rl.headers });
      }
    }

    if (body.adminNotes !== undefined) {
      updated = updateNotes(id, body.adminNotes);
      if (!updated) {
        return Response.json({ error: "Not found" }, { status: 404, headers: rl.headers });
      }
    }

    if (!updated) {
      return Response.json({ error: "No valid fields to update" }, { status: 400, headers: rl.headers });
    }

    return Response.json({ submission: updated }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "PATCH", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

/** DELETE /api/submissions/[id] — Admin only */
export async function DELETE(request, { params }) {
  const ip = getClientIP(request);
  const session = await getSession();
  if (!session) {
    logger.warn("API_ERROR_401", { ip, method: "DELETE", path: `/api/submissions/${(await params).id}` });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Require admin role — not just any session
  if (session.role !== "admin") {
    logger.warn("API_ERROR_403", { ip, method: "DELETE", email: session.email });
    return Response.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const rl = checkRateLimit(ip, "admin");
  if (!rl.allowed) return rateLimitResponse(rl);

  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ error: "Not found" }, { status: 404, headers: rl.headers });
  }

  const removed = remove(id);
  if (!removed) {
    return Response.json({ error: "Not found" }, { status: 404, headers: rl.headers });
  }

  logger.info("DATA_DELETED", { id, admin: redactEmail(session.email) });
  return Response.json({ success: true }, { headers: rl.headers });
}
