/* HydroPulse Reviews Store — server-side JSON file CRUD with sanitization */

import { join } from "path";
import { randomUUID } from "crypto";
import { logger } from "../logger.js";
import { getCachedJSON, queueJSONWrite, checkNegativeCache, setNegativeCache } from "../io-manager.js";
import { syncReview, supabase } from "../supabaseClient.js";

const DATA_DIR = join(process.cwd(), "data");
const REVIEWS_FILE = join(DATA_DIR, "hp_reviews.json");

const MAX_NAME_LEN = 80;
const MAX_LOCATION_LEN = 100;
const MAX_COMMENT_LEN = 2000;

/* ─── Sanitization ─── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").trim();
}

/* ─── File I/O ─── */
function read() {
  return getCachedJSON(REVIEWS_FILE, []);
}

function write(data) {
  queueJSONWrite(REVIEWS_FILE, data);
}

function mergeById(localArr, dbArr) {
  const map = new Map();
  for (const item of localArr) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of dbArr) {
    if (item && item.id) map.set(item.id, item);
  }
  return Array.from(map.values());
}

/* ─── CRUD ─── */

export async function getReviews() {
  const localReviews = read().filter((r) => r.status === "approved");
  try {
    const { data, error } = await supabase
      .from('hydropulse_reviews')
      .select('*')
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false });
    if (!error && data) {
      const dbReviews = data.map(r => ({
        id: r.id,
        name: r.reviewer_name,
        rating: r.rating,
        location: r.location || "India",
        comment: r.comment,
        initial: r.reviewer_name ? r.reviewer_name.charAt(0).toUpperCase() : 'A',
        verified: r.verified || false,
        status: r.status || 'approved',
        submittedAt: r.submitted_at,
        submittedByIp: r.ip_address,
        date: new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      }));
      return mergeById(localReviews, dbReviews).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
  } catch (err) {
    logger.warn("SUPABASE_GET_REVIEWS_FALLBACK", { error: err.message });
  }
  return localReviews;
}

export function getAllReviewsAdmin() {
  return read();
}

export function countRecentByIp(ip, windowMs = 60 * 60 * 1000) {
  const cutoff = Date.now() - windowMs;
  return read().filter((r) => r.submittedByIp === ip && new Date(r.submittedAt).getTime() > cutoff).length;
}

/**
 * Add a new review with full validation and sanitization
 * @returns {{ review?: object, errors?: object }}
 */
export function addReview(reviewData, submittedByIp = "unknown") {
  const errors = {};

  const name = sanitize(reviewData.name || "");
  if (!name || name.length < 2 || name.length > MAX_NAME_LEN) {
    errors.name = `Name must be 2–${MAX_NAME_LEN} characters`;
  }

  const location = sanitize(reviewData.location || "").slice(0, MAX_LOCATION_LEN);

  const rawRating = parseInt(reviewData.rating, 10);
  if (isNaN(rawRating) || rawRating < 1 || rawRating > 5) {
    errors.rating = "Rating must be 1–5";
  }
  const rating = Math.max(1, Math.min(5, rawRating || 5));

  const comment = sanitize(reviewData.comment || "");
  if (!comment || comment.length < 10 || comment.length > MAX_COMMENT_LEN) {
    errors.comment = `Review comment must be 10–${MAX_COMMENT_LEN} characters`;
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const all = read();

  const review = {
    id: randomUUID(),
    name,
    location: location || "India",
    rating,
    comment,
    initial: name.charAt(0).toUpperCase(),
    verified: false,           // Admin can verify after review
    status: "approved",        // Auto-approve (can change to "pending" for moderation)
    submittedAt: new Date().toISOString(),
    submittedByIp,             // For moderation / rate limiting
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };

  all.unshift(review);
  write(all);

  logger.info("HP_REVIEW_SUBMITTED", {
    id: review.id,
    name: name.slice(0, 3) + "***",
    rating,
    ip: submittedByIp,
  });

  syncReview(review);
  return { review };
}

export function updateReviewStatus(id, status) {
  const ALLOWED = ["approved", "pending", "rejected"];
  if (!ALLOWED.includes(status)) return null;

  const all = read();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  write(all);

  logger.info("HP_REVIEW_STATUS_UPDATED", { id, status });
  syncReview(all[idx]);
  return all[idx];
}
