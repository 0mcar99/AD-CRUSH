import { getAll } from "@/lib/submissions-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { getClientIP } from "@/lib/logger";

export async function GET(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "scraping");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const all = getAll();
    const approved = all.filter((s) => s.status === "approved");
    return Response.json({ campaigns: approved }, { headers: rl.headers });
  } catch (err) {
    return Response.json({ error: "Failed to fetch approved campaigns" }, { status: 500 });
  }
}
