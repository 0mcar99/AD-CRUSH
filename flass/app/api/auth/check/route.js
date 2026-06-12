export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ authenticated: false });
    }
    return Response.json({
      authenticated: true,
      email: session.email,
      role: session.role || "user",
      initial: session.initial || "U",
    });
  } catch {
    return Response.json({ authenticated: false });
  }
}
