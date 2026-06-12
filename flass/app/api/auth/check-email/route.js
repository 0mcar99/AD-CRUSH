export const dynamic = 'force-dynamic';

import { emailExists } from "@/lib/users-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { getClientIP } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "general");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400, headers: rl.headers });
    }

    const exists = await emailExists(email);
    return Response.json({ exists }, { headers: rl.headers });
  } catch (err) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
