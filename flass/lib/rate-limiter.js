/* Tiered Sliding Window Rate Limiter — in-memory, server-only */

import { logger, getClientIP, redactEmail } from "./logger.js";

/**
 * Rate limit tiers: { maxRequests, windowMs }
 */
const TIERS = {
  login:      { maxRequests: 150,  windowMs: 15 * 60 * 1000 },  // 150 per 15 min
  submission: { maxRequests: 100,  windowMs: 15 * 60 * 1000 },  // 100 per 15 min
  chat:       { maxRequests: 120,  windowMs: 60 * 1000 },        // 120 per min
  admin:      { maxRequests: 120,  windowMs: 60 * 1000 },        // 120 per min
  general:    { maxRequests: 500,  windowMs: 60 * 1000 },        // 500 per min
  scraping:   { maxRequests: 30,   windowMs: 60 * 1000 },        // 30 per min
};

/** Map<string, number[]> — key is "ip:tier", value is array of timestamps */
const store = new Map();

/** Velocity tracking — Map<string, number[]> for burst detection */
const velocityStore = new Map();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const tier = key.split(":").pop();
      const windowMs = TIERS[tier]?.windowMs || 60000;
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) store.delete(key);
      else store.set(key, valid);
    }
    for (const [key, timestamps] of velocityStore.entries()) {
      const valid = timestamps.filter((t) => now - t < 10000);
      if (valid.length === 0) velocityStore.delete(key);
      else velocityStore.set(key, valid);
    }
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit for an IP and tier
 * @param {string} ip
 * @param {string} tier - One of: login, submission, admin, general, scraping
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, retryAfter: number, headers: object }}
 */
export function checkRateLimit(ip, tier) {
  const config = TIERS[tier];
  if (!config) return { allowed: true, remaining: 999, resetAt: 0, retryAfter: 0, headers: {} };

  const key = `${ip}:${tier}`;
  const now = Date.now();
  const timestamps = (store.get(key) || []).filter((t) => now - t < config.windowMs);

  const allowed = timestamps.length < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - timestamps.length - (allowed ? 1 : 0));
  const resetAt = timestamps.length > 0 ? timestamps[0] + config.windowMs : now + config.windowMs;
  const retryAfter = allowed ? 0 : Math.ceil((resetAt - now) / 1000);

  if (allowed) {
    timestamps.push(now);
    store.set(key, timestamps);
  } else {
    logger.warn("RATE_LIMITED", { ip, tier, count: timestamps.length, limit: config.maxRequests });
  }

  const headers = {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };

  if (!allowed) {
    headers["Retry-After"] = String(retryAfter);
  }

  return { allowed, remaining, resetAt, retryAfter, headers };
}

/**
 * Check request velocity (burst detection) — >20 requests in 10 seconds
 * @param {string} ip
 * @returns {boolean} true if suspicious
 */
export function checkVelocity(ip) {
  const now = Date.now();
  const timestamps = (velocityStore.get(ip) || []).filter((t) => now - t < 10000);
  timestamps.push(now);
  velocityStore.set(ip, timestamps);

  if (timestamps.length > 20) {
    logger.warn("ANOMALY_HIGH_VELOCITY", { ip, requestsIn10s: timestamps.length });
    return true;
  }
  return false;
}

/** Create a rate-limited error response */
export function rateLimitResponse(result) {
  return Response.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: result.headers }
  );
}

/* ─── Bot Detection ─── */

const BOT_PATTERNS = [
  /curl\//i, /wget\//i, /python-requests/i, /python-urllib/i,
  /scrapy/i, /httpclient/i, /java\//i, /libwww/i,
  /mechanize/i, /phantom/i, /selenium/i, /puppeteer/i,
  /headless/i, /node-fetch/i, /axios\//i,
  /bot(?!.*google|.*bing|.*yahoo|.*duckduck|.*slack|.*discord|.*telegram)/i,
];

/**
 * Detect if request is from an automated bot
 * @param {Request} request
 * @returns {{ isBot: boolean, reason: string|null }}
 */
export function detectBot(request) {
  const ua = request.headers.get("user-agent") || "";

  // 1. No user-agent at all
  if (!ua || ua.trim().length === 0) {
    return { isBot: true, reason: "missing_user_agent" };
  }

  // 2. Known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: true, reason: `bot_ua_match: ${pattern.source}` };
    }
  }

  // 3. Missing standard browser headers
  const signals = [
    !request.headers.get("accept"),
    !request.headers.get("accept-language"),
    !request.headers.get("accept-encoding"),
    request.headers.get("accept") === "*/*",
  ];
  const suspiciousCount = signals.filter(Boolean).length;
  if (suspiciousCount >= 3) {
    return { isBot: true, reason: "missing_browser_headers" };
  }

  return { isBot: false, reason: null };
}
