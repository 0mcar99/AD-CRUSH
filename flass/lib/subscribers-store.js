/* Subscribers Store — server-side JSON file CRUD with validation */

import { join } from "path";
import { randomUUID } from "crypto";
import { logger } from "./logger.js";
import { getCachedJSON, queueJSONWrite } from "./io-manager.js";
import { syncSubscriber, supabase } from "./supabaseClient.js";

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

export async function getAll() {
  const localSubscribers = read();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (!error && data) {
      const dbSubscribers = data.map(s => ({
        id: s.id,
        email: s.email,
        subscribedAt: s.subscribed_at,
        active: s.active
      }));
      return mergeById(localSubscribers, dbSubscribers).sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
    }
    } catch (err) {
      logger.warn("SUPABASE_GET_SUBSCRIBERS_FALLBACK", { error: err.message });
    }
  }
  return localSubscribers;
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

export function deleteSubscriberByEmail(email) {
  if (!email) return false;
  const cleaned = (email || "").trim().toLowerCase();
  const all = read();
  const filtered = all.filter((s) => s.email !== cleaned);
  if (filtered.length === all.length) return false;
  write(filtered);
  
  if (supabase) {
    try {
      supabase.from('subscribers').delete().eq('email', cleaned);
    } catch (err) {
      logger.warn("SUPABASE_DELETE_SUBSCRIBER_ERROR", { email: cleaned, error: err.message });
    }
  }
  return true;
}
