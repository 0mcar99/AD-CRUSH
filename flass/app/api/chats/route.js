import { getSession } from "@/lib/session";
import { getChats, addMessage, getChatUsers } from "@/lib/chats-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP } from "@/lib/logger";

export async function GET(request) {
  const ip = getClientIP(request);

  const session = await getSession();
  if (!session) {
    logger.warn("API_ERROR_401", { ip, method: "GET", path: "/api/chats" });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = checkRateLimit(ip, "chat");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get("email");

    if (session.role === "admin") {
      if (targetEmail) {
        // Admin requesting messages of a specific user
        const chats = await getChats(targetEmail);
        return Response.json({ chats }, { headers: rl.headers });
      } else {
        // Admin requesting list of all chat users
        const users = await getChatUsers();
        return Response.json({ users }, { headers: rl.headers });
      }
    } else {
      // Normal user requesting their own chat history
      const chats = await getChats(session.email);
      return Response.json({ chats }, { headers: rl.headers });
    }
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "GET", path: "/api/chats", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request) {
  const ip = getClientIP(request);

  const session = await getSession();
  if (!session) {
    logger.warn("API_ERROR_401", { ip, method: "POST", path: "/api/chats" });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = checkRateLimit(ip, "chat");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const { text, email } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "Message text is required" }, { status: 400, headers: rl.headers });
    }

    if (session.role === "admin") {
      const targetUser = email || "adcrushadmin";
      const message = addMessage(targetUser, "admin", text);
      return Response.json({ success: true, message }, { headers: rl.headers });
    } else {
      const message = addMessage(session.email, "user", text);
      return Response.json({ success: true, message }, { headers: rl.headers });
    }
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "POST", path: "/api/chats", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
