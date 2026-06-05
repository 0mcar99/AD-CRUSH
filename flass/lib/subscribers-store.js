/* Subscribers Store — server-side JSON file CRUD with validation */

import { join } from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger.js";
import { getCachedJSON, queueJSONWrite } from "./io-manager.js";
import { syncSubscriber } from "./supabaseClient.js";

const DATA_DIR = join(process.cwd(), "data");
const SUBS_FILE = join(DATA_DIR, "subscribers.json");

/* ─── Sanitization ─── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/* ─── File I/O ─── */
function read() {
  return getCachedJSON(SUBS_FILE, []);
}

function write(data) {
  queueJSONWrite(SUBS_FILE, data);
}

/* ─── CRUD ─── */

export function getAll() {
  return read();
}

export function getCount() {
  return read().length;
}

/**
 * Subscribe an email
 * @returns {{ entry?: object, error?: string, alreadyExists?: boolean }}
 */
export function subscribe(email, source = "homepage") {
  if (!email || typeof email !== "string") {
    return { error: "Email is required" };
  }

  const cleaned = sanitize(email).toLowerCase();
  if (!isValidEmail(cleaned)) {
    return { error: "Invalid email format" };
  }

  const all = read();

  // Duplicate check
  const existing = all.find((s) => s.email === cleaned);
  if (existing) {
    return { alreadyExists: true, entry: existing };
  }

  const entry = {
    id: randomUUID(),
    email: cleaned,
    source,
    subscribedAt: new Date().toISOString(),
    active: true,
  };

  all.push(entry);
  write(all);

  logger.info("SUBSCRIBER_ADDED", { id: entry.id, source });
  syncSubscriber(entry);
  return { entry };
}

/**
 * Unsubscribe an email
 */
export function unsubscribe(email) {
  const cleaned = (email || "").trim().toLowerCase();
  const all = read();
  const idx = all.findIndex((s) => s.email === cleaned);

  if (idx === -1) return false;

  all[idx].active = false;
  all[idx].unsubscribedAt = new Date().toISOString();
  write(all);

  logger.info("SUBSCRIBER_REMOVED", { id: all[idx].id });
  syncSubscriber(all[idx]);
  return true;
}
