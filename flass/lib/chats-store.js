/* Chats Store — server-side JSON file CRUD for persistence */

import { join } from "path";
import { logger } from "./logger.js";
import { getCachedJSON, queueJSONWrite } from "./io-manager.js";
import { syncChat, supabase } from "./supabaseClient.js";

const DATA_DIR = join(process.cwd(), "data");
const CHATS_FILE = join(DATA_DIR, "chats.json");

function read() {
  return getCachedJSON(CHATS_FILE, {});
}

function write(data) {
  queueJSONWrite(CHATS_FILE, data);
}

/**
 * Get chat messages for a specific user email
 * @param {string} email
 * @returns {Array} Array of message objects
 */
export async function getChats(email) {
  if (!email) return [];
  const cleaned = email.toLowerCase().trim();
  const localChats = read()[cleaned] || [];

  let dbChats = [];
  if (supabase) {
    try {
      const { data: vis } = await supabase
        .from('visitors')
        .select('id')
        .eq('email', cleaned)
        .limit(1);
      const visitorId = vis && vis[0] ? vis[0].id : null;

      if (visitorId) {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('visitor_id', visitorId)
          .order('created_at', { ascending: true });
        if (!error && data) {
          dbChats = data.map(row => ({
            role: row.sender,
            text: row.message,
            timestamp: row.created_at
          }));
        }
      }
    } catch (err) {
      logger.warn("SUPABASE_GET_CHATS_FALLBACK", { email: cleaned, error: err.message });
    }
  }

  if (localChats.length === 0 && dbChats.length === 0) {
    return [
      {
        role: "bot",
        text: "Hi there! How can we help you with your campaign today?",
        timestamp: new Date().toISOString()
      }
    ];
  }

  // Merge chats: combine both and sort by timestamp
  const combined = [...localChats, ...dbChats];
  // Deduplicate by text + role
  const seen = new Set();
  const unique = [];
  for (const msg of combined) {
    const key = `${msg.role}:${msg.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(msg);
    }
  }
  return unique.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Add a message to a user's chat thread
 * @param {string} email
 * @param {"user"|"admin"|"bot"} role
 * @param {string} text
 * @returns {object} The created message object
 */
export function addMessage(email, role, text) {
  if (!email || !role || !text) return null;
  const cleaned = email.toLowerCase().trim();

  // Sanitize text: strip HTML tags and limit length to prevent XSS and flooding
  const sanitizedText = String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"']/g, "")
    .trim()
    .slice(0, 2000);

  if (!sanitizedText) return null;

  const all = read();
  if (!all[cleaned]) {
    all[cleaned] = [
      {
        role: "bot",
        text: "Hi there! How can we help you with your campaign today?",
        timestamp: new Date().toISOString()
      }
    ];
  }
  const message = {
    role,
    text: sanitizedText,
    timestamp: new Date().toISOString()
  };
  all[cleaned].push(message);
  write(all);
  logger.info("CHAT_MESSAGE_ADDED", { email: cleaned, role });
  syncChat(cleaned, role, sanitizedText);
  return message;
}

/**
 * Get all users with active chat threads
 * @returns {Array} Array of user chat headers
 */
export async function getChatUsers() {
  // 1. Try to fetch from Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('message, sender, created_at, visitors(email)')
        .order('created_at', { ascending: true });
      if (!error && data) {
        const visitorMap = new Map();
        for (const row of data) {
          const email = row.visitors?.email;
          if (!email) continue;
          visitorMap.set(email, {
            email,
            lastMessage: row.message,
            timestamp: row.created_at
          });
        }
        return Array.from(visitorMap.values());
      }
    } catch (err) {
      logger.warn("SUPABASE_GET_CHAT_USERS_FALLBACK", { error: err.message });
    }
  }

  // 2. Fallback to local store
  const all = read();
  return Object.keys(all).map((email) => {
    const messages = all[email];
    const lastMsg = messages[messages.length - 1];
    return {
      email,
      lastMessage: lastMsg ? lastMsg.text : "",
      timestamp: lastMsg ? lastMsg.timestamp : new Date().toISOString()
    };
  });
}
