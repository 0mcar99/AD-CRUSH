/* /api/hydropulse/orders — Secure order placement with server-side price locking */

import { placeOrder } from "@/lib/hydropulse/orders-store";
import { checkRateLimit, rateLimitResponse, detectBot } from "@/lib/rate-limiter";
import { logger, getClientIP, redactEmail } from "@/lib/logger";

export async function POST(request) {
  const ip = getClientIP(request);

  // 1. Bot detection
  const botCheck = detectBot(request);
  if (botCheck.isBot) {
    logger.warn("HP_ORDER_BOT_BLOCKED", { ip, reason: botCheck.reason });
    // Silent 200 to confuse bots — they think it worked
    return Response.json({ success: true, orderId: "HP-INVALID" }, { status: 200 });
  }

  // 2. Rate limiting — max 3 orders per hour per IP
  const rl = checkRateLimit(ip, "submission");
  if (!rl.allowed) {
    logger.warn("HP_ORDER_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();

    // 3. Honeypot check — bots fill hidden fields
    if (body._hp_field) {
      logger.warn("HP_ORDER_HONEYPOT", { ip });
      // Silent success to confuse bots
      return Response.json({ success: true, orderId: "HP-INVALID" }, { status: 200 });
    }

    // 4. Timing validation — reject if submitted too fast (< 5 seconds)
    if (body._formStartedAt) {
      const elapsed = Date.now() - body._formStartedAt;
      if (elapsed >= 0 && elapsed < 5000) {
        logger.warn("HP_ORDER_TIMING_VIOLATION", { ip, elapsed });
        return Response.json(
          { error: "Please review your order details before submitting." },
          { status: 400, headers: rl.headers }
        );
      }
    }

    // 5. Remove meta fields before processing
    const { _hp_field, _formStartedAt, ...orderData } = body;

    // 6. Place order — prices are LOCKED server-side, client prices ignored
    const result = placeOrder(orderData);

    if (result.errors) {
      logger.warn("HP_ORDER_VALIDATION_FAILED", { ip, fields: Object.keys(result.errors) });
      return Response.json(
        { error: "Validation failed", fields: result.errors },
        { status: 400, headers: rl.headers }
      );
    }

    logger.info("HP_ORDER_SUCCESS", {
      ip,
      orderId: result.order.id,
      total: result.order.totalAmount,
      email: result.order.email ? redactEmail(result.order.email) : "none",
    });

    return Response.json(
      {
        success: true,
        orderId: result.order.id,
        totalAmount: result.order.totalAmount,
        currency: result.order.currency,
        message: "Order placed successfully! Our team will contact you within 24 hours.",
      },
      { status: 201, headers: rl.headers }
    );
  } catch (err) {
    logger.error("HP_ORDER_API_ERROR", { ip, error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request) {
  const ip = getClientIP(request);
  const rl = checkRateLimit(ip, "admin");
  if (!rl.allowed) return rateLimitResponse(rl);

  // Admin-only endpoint — require session auth
  try {
    const { getSession } = await import("@/lib/session");
    const { requireAdmin } = await import("@/lib/admin-auth");

    const adminSession = await requireAdmin();
    if (!adminSession) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getAllOrders } = await import("@/lib/hydropulse/orders-store");
    const orders = await getAllOrders();

    return Response.json({ orders }, { headers: rl.headers });
  } catch (err) {
    logger.error("HP_ORDERS_GET_ERROR", { ip, error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
