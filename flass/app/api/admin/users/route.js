import { requireAdmin } from "@/lib/admin-auth";
import { getAllUsers } from "@/lib/users-store";
import { getAll as getAllSubmissions } from "@/lib/submissions-store";
import { getChatUsers } from "@/lib/chats-store";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";
import { logger, getClientIP } from "@/lib/logger";

export async function GET(request) {
  const ip = getClientIP(request);

  // 1. Authorize Admin
  const adminSession = await requireAdmin();
  if (!adminSession) {
    logger.warn("API_ERROR_401", { ip, method: "GET", path: "/api/admin/users" });
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit
  const rl = checkRateLimit(ip, "admin");
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").toLowerCase().trim();

    const registeredUsers = await getAllUsers();
    const submissions = await getAllSubmissions();
    const chatUsers = await getChatUsers();

    // Fetch HydroPulse orders to aggregate order metrics
    let orders = [];
    try {
      const { getAllOrders } = await import("@/lib/hydropulse/orders-store");
      orders = await getAllOrders();
    } catch (e) {
      logger.error("HP_ORDERS_IMPORT_ERROR", { error: e.message });
    }

    // Map to keep track of unified contact information by email
    const contactMap = new Map();

    // Initialize map with registered users
    for (const u of registeredUsers) {
      if (!u.email) continue;
      const emailLower = u.email.toLowerCase().trim();
      contactMap.set(emailLower, {
        id: u.id,
        email: u.email,
        phone: u.phone || "",
        countryCode: u.countryCode || "",
        createdAt: u.createdAt || "",
        role: u.role || "user",
        registered: true,
        hpOrdersCount: 0
      });
    }

    // Populate or enrich with submission details (guests who submitted campaigns)
    for (const sub of submissions) {
      if (!sub.email) continue;
      const emailLower = sub.email.toLowerCase().trim();
      if (!contactMap.has(emailLower)) {
        contactMap.set(emailLower, {
          id: sub.id,
          email: sub.email,
          phone: "",
          countryCode: "",
          createdAt: sub.createdAt || "",
          role: "guest",
          registered: false,
          hpOrdersCount: 0
        });
      }
    }

    // Populate or enrich with chat users
    for (const cu of chatUsers) {
      if (!cu.email) continue;
      const emailLower = cu.email.toLowerCase().trim();
      if (!contactMap.has(emailLower)) {
        contactMap.set(emailLower, {
          id: emailLower,
          email: cu.email,
          phone: "",
          countryCode: "",
          createdAt: cu.timestamp || "",
          role: "chat_only",
          registered: false,
          hpOrdersCount: 0
        });
      }
    }

    // Enrich with HydroPulse order details
    for (const order of orders) {
      if (!order.email) continue;
      const emailLower = order.email.toLowerCase().trim();
      if (contactMap.has(emailLower)) {
        const contact = contactMap.get(emailLower);
        contact.hpOrdersCount = (contact.hpOrdersCount || 0) + 1;
        if (!contact.phone && order.phone) {
          contact.phone = order.phone;
        }
      } else {
        contactMap.set(emailLower, {
          id: order.id,
          email: order.email,
          phone: order.phone || "",
          countryCode: "",
          createdAt: order.placedAt || "",
          role: "customer",
          registered: false,
          hpOrdersCount: 1
        });
      }
    }

    // Convert map to array
    let contacts = Array.from(contactMap.values());

    // Apply filtering
    if (query) {
      contacts = contacts.filter(
        (c) =>
          (c.email || "").toLowerCase().includes(query) ||
          (c.phone || "").includes(query)
      );
    }

    // Sort: registered users first, then guests, then chat only
    contacts.sort((a, b) => {
      if (a.registered !== b.registered) return a.registered ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return Response.json({ users: contacts }, { headers: rl.headers });
  } catch (err) {
    logger.error("API_ERROR_500", { ip, method: "GET", path: "/api/admin/users", error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
