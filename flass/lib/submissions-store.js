/* Submissions Store — server-side JSON file CRUD with validation */

import { join } from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger.js";
import { getCachedJSON, queueJSONWrite } from "./io-manager.js";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "submissions.json");

/* ─── Allowed enums ─── */
const ALLOWED_AD_TYPES = ["Product", "Event", "Company", "App", "Service", "Other"];
const ALLOWED_CATEGORIES = ["Automotive", "Fashion", "Tech", "Food & Beverage", "Events", "Lifestyle", "Industrial", "Health", "Education", "Other"];
const ALLOWED_AUDIENCES = ["Gen Z (18-24)", "Millennials (25-34)", "Adults (35-50)", "Seniors (50+)", "Everyone", "B2B / Professionals"];
const ALLOWED_PLATFORMS = ["Instagram", "Facebook", "TikTok", "YouTube", "X (Twitter)", "LinkedIn", "Google Ads", "Pinterest"];
const ALLOWED_BUDGETS = ["Under $500", "$500 - $2,000", "$2,000 - $10,000", "$10,000 - $50,000", "$50,000+", "Let's discuss"];
const ALLOWED_TIMELINES = ["ASAP", "Within 1 week", "Within 1 month", "Within 3 months", "Flexible"];
const ALLOWED_DURATIONS = ["1 week", "2 weeks", "1 month", "3 months", "6 months", "Ongoing"];
const ALLOWED_STATUSES = ["pending", "in_review", "approved", "rejected"];

/* ─── Sanitization ─── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidUrl(url) {
  if (!url) return true; // optional
  return /^https?:\/\/.+/.test(url) && url.length <= 500;
}

/* ─── File I/O ─── */
function read() {
  return getCachedJSON(DATA_FILE, []);
}

function write(data) {
  queueJSONWrite(DATA_FILE, data);
}

/* ─── CRUD ─── */

export function getAll() {
  return read();
}

export function getById(id) {
  return read().find((s) => s.id === id) || null;
}

/**
 * Validate and add a submission
 * @returns {{ entry?: object, errors?: object }}
 */
export function add(submission) {
  const errors = {};

  // Required string fields
  const name = sanitize(submission.name);
  if (!name || name.length < 2 || name.length > 100) errors.name = "Required, 2-100 characters";

  const email = (submission.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) errors.email = "Invalid email format";

  const adType = submission.adType;
  if (!ALLOWED_AD_TYPES.includes(adType)) errors.adType = "Invalid selection";

  const productName = sanitize(submission.productName);
  if (!productName || productName.length > 200) errors.productName = "Required, max 200 characters";

  const tagline = sanitize(submission.tagline);
  if (!tagline || tagline.length > 300) errors.tagline = "Required, max 300 characters";

  const description = sanitize(submission.description);
  if (!description || description.length > 5000) errors.description = "Required, max 5000 characters";

  const category = submission.category;
  if (!ALLOWED_CATEGORIES.includes(category)) errors.category = "Invalid selection";

  const audience = submission.audience;
  if (!ALLOWED_AUDIENCES.includes(audience)) errors.audience = "Invalid selection";

  const platforms = submission.platforms;
  if (!Array.isArray(platforms) || platforms.length === 0 || platforms.length > 8 || !platforms.every((p) => ALLOWED_PLATFORMS.includes(p)))
    errors.platforms = "Select 1-8 valid platforms";

  const budget = submission.budget;
  if (!ALLOWED_BUDGETS.includes(budget)) errors.budget = "Invalid selection";

  const timeline = submission.timeline;
  if (!ALLOWED_TIMELINES.includes(timeline)) errors.timeline = "Invalid selection";

  const duration = submission.duration;
  if (!ALLOWED_DURATIONS.includes(duration)) errors.duration = "Invalid selection";

  // Optional fields
  const website = sanitize(submission.website || "");
  if (website && !isValidUrl(submission.website)) errors.website = "Invalid URL format";

  const notes = sanitize(submission.notes || "").slice(0, 2000);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const all = read();
  const entry = {
    id: randomUUID(),
    name, email, adType, productName, tagline, description,
    category, audience, platforms, budget, timeline, duration,
    website, notes,
    status: "pending",
    createdAt: new Date().toISOString(),
    adminNotes: "",
  };
  all.unshift(entry);
  write(all);

  logger.info("DATA_SUBMISSION_CREATED", { id: entry.id, name: entry.name });
  return { entry };
}

export function updateStatus(id, status) {
  if (!ALLOWED_STATUSES.includes(status)) return null;

  const all = read();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const oldStatus = all[idx].status;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  write(all);

  logger.info("DATA_STATUS_CHANGED", { id, oldStatus, newStatus: status });
  return all[idx];
}

export function updateNotes(id, notes) {
  if (typeof notes !== "string") return null;
  const sanitized = sanitize(notes).slice(0, 2000);

  const all = read();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  all[idx].adminNotes = sanitized;
  all[idx].updatedAt = new Date().toISOString();
  write(all);

  logger.info("DATA_NOTES_UPDATED", { id });
  return all[idx];
}

export function remove(id) {
  const all = read();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length === all.length) return false;
  write(filtered);
  logger.info("DATA_DELETED", { id });
  return true;
}

export function getCounts() {
  const all = read();
  return {
    total: all.length,
    pending: all.filter((s) => s.status === "pending").length,
    in_review: all.filter((s) => s.status === "in_review").length,
    approved: all.filter((s) => s.status === "approved").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };
}
