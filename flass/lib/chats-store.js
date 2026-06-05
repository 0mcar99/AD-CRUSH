/* Chats Store — server-side JSON file CRUD for persistence */

import { join } from "path";
import { logger } from "./logger.js";
import { getCachedJSON, queueJSONWrite } from "./io-manager.js";
import { syncChat } from "./supabaseClient.js";

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
export function getChats(email) {
  if (!email) return [];
  const cleaned = email.toLowerCase().trim();
  const all = read();
  if (!all[cleaned]) {
    // Return default message if no history yet
    return [
      {
        role: "bot",
        text: "Hi there! How can we help you with your campaign today?",
        timestamp: new Date().toISOString()
      }
    ];
  }
  return all[cleaned];
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
export function getChatUsers() {
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
