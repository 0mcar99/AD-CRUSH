import { deleteSession, getSession } from "@/lib/session";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);

  try {
    const session = await getSession();
    if (session) {
      logger.info("AUTH_LOGOUT", { ip, email: redactEmail(session.email) });
    }
    await deleteSession();
    return Response.json({ success: true });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, path: "/api/auth/logout", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
