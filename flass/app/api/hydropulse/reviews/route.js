/* /api/hydropulse/reviews — Secure review submittal and fetching */

import { addReview, getReviews } from "@/lib/hydropulse/reviews-store";
import { checkRateLimit, rateLimitResponse, detectBot } from "@/lib/rate-limiter";
import { logger, getClientIP } from "@/lib/logger";

export async function GET(request) {
  const ip = getClientIP(request);

  // Rate limiting for reading reviews (scraping tier)
  const rl = checkRateLimit(ip, "scraping");
  if (!rl.allowed) {
    logger.warn("HP_REVIEWS_GET_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const reviews = getReviews();
    return Response.json({ reviews }, { status: 200, headers: rl.headers });
  } catch (err) {
    logger.error("HP_REVIEWS_GET_API_ERROR", { ip, error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request) {
  const ip = getClientIP(request);

  // 1. Bot detection
  const botCheck = detectBot(request);
  if (botCheck.isBot) {
    logger.warn("HP_REVIEW_BOT_BLOCKED", { ip, reason: botCheck.reason });
    // Silent 200 to confuse bots
    return Response.json({ success: true, message: "Review submitted successfully!" }, { status: 200 });
  }

  // 2. Rate limiting — max 3 reviews per hour per IP (submission tier)
  const rl = checkRateLimit(ip, "submission");
  if (!rl.allowed) {
    logger.warn("HP_REVIEW_RATE_LIMITED", { ip });
    return rateLimitResponse(rl);
  }

  try {
    const body = await request.json();

    // 3. Honeypot check — bots fill hidden fields
    if (body._hp_field) {
      logger.warn("HP_REVIEW_HONEYPOT", { ip });
      return Response.json({ success: true, message: "Review submitted successfully!" }, { status: 200 });
    }

    // 4. Timing validation — reject if submitted too fast (< 5 seconds)
    if (body._formStartedAt) {
      const elapsed = Date.now() - body._formStartedAt;
      if (elapsed >= 0 && elapsed < 5000) {
        logger.warn("HP_REVIEW_TIMING_VIOLATION", { ip, elapsed });
        return Response.json(
          { error: "Please take a moment to write a genuine review." },
          { status: 400, headers: rl.headers }
        );
      }
    }

    // 5. Remove meta fields before processing
    const { _hp_field, _formStartedAt, ...reviewData } = body;

    // 6. Add review
    const result = addReview(reviewData, ip);

    if (result.errors) {
      logger.warn("HP_REVIEW_VALIDATION_FAILED", { ip, fields: Object.keys(result.errors) });
      return Response.json(
        { error: "Validation failed", fields: result.errors },
        { status: 400, headers: rl.headers }
      );
    }

    return Response.json(
      {
        success: true,
        review: result.review,
        message: "Review submitted successfully!",
      },
      { status: 201, headers: rl.headers }
    );
  } catch (err) {
    logger.error("HP_REVIEW_API_ERROR", { ip, error: err.message });
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
