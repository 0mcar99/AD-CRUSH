/* HydroPulse Orders Store — server-side JSON file CRUD with price locking */

import { join } from "path";
import { randomUUID } from "crypto";
import { logger } from "../logger.js";
import { getCachedJSON, queueJSONWrite } from "../io-manager.js";

const DATA_DIR = join(process.cwd(), "data");
const ORDERS_FILE = join(DATA_DIR, "hp_orders.json");

/* ─── SERVER-SIDE PRICE CATALOG (Source of Truth) ─── */
/* Prices are LOCKED here. Client-side cart prices are IGNORED. */
export const PRODUCT_CATALOG = {
  "marlin-1":           { title: "Marlin 1.0",             price: 50000 },
  "marlin-pro":         { title: "Marlin Pro",              price: 60000 },
  "marlin-industrial":  { title: "HydroPulse Industrial",   price: 79999 },
};

const MAX_QTY_PER_ITEM = 10;  // Max 10 units per item per order

/* ─── Sanitization ─── */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").trim();
}

function isValidPhone(phone) {
  // Indian phone numbers: 10 digits, optionally prefixed with +91
  const digits = phone.replace(/[\s\-\(\)\+]/g, "");
  return /^\d{10,13}$/.test(digits);
}

function isValidZip(zip) {
  return /^\d{6}$/.test(zip.replace(/\s/g, ""));
}

function isValidEmail(email) {
  if (!email) return true; // email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/* ─── File I/O ─── */
function read() {
  return getCachedJSON(ORDERS_FILE, []);
}

function write(data) {
  queueJSONWrite(ORDERS_FILE, data);
}

/* ─── CRUD ─── */

/**
 * Place a new order with server-side price locking
 * @returns {{ order?: object, errors?: object }}
 */
export function placeOrder(orderData) {
  const errors = {};

  // Validate customer details
  const name = sanitize(orderData.name || "");
  if (!name || name.length < 2 || name.length > 100) {
    errors.name = "Name must be 2–100 characters";
  }

  const phone = sanitize(orderData.phone || "");
  if (!phone || !isValidPhone(phone)) {
    errors.phone = "Valid Indian phone number required (10 digits)";
  }

  const email = sanitize(orderData.email || "").toLowerCase();
  if (email && !isValidEmail(email)) {
    errors.email = "Invalid email format";
  }

  const address = sanitize(orderData.address || "");
  if (!address || address.length < 10 || address.length > 500) {
    errors.address = "Address must be 10–500 characters";
  }

  const zip = sanitize(orderData.zip || "");
  if (!zip || !isValidZip(zip)) {
    errors.zip = "Valid 6-digit Indian PIN code required";
  }

  // Validate payment method
  const paymentMethod = orderData.paymentMethod;
  if (!["upi", "card"].includes(paymentMethod)) {
    errors.paymentMethod = "Invalid payment method";
  }

  // ─── PRICE LOCKING: Validate & recompute items from catalog ───
  const rawItems = orderData.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    errors.items = "Cart cannot be empty";
  }

  let lockedItems = [];
  let lockedTotal = 0;

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    for (const item of rawItems) {
      const productId = String(item.id || "");
      const catalogEntry = PRODUCT_CATALOG[productId];

      if (!catalogEntry) {
        errors.items = `Unknown product ID: ${productId}`;
        break;
      }

      // Enforce quantity limits
      const qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, parseInt(item.quantity, 10) || 1));
      const lockedPrice = catalogEntry.price; // IGNORE client price — use catalog price

      lockedItems.push({
        id: productId,
        title: catalogEntry.title,
        price: lockedPrice,   // Server-locked price
        quantity: qty,
        lineTotal: lockedPrice * qty,
      });
      lockedTotal += lockedPrice * qty;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const orderId = `HP-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const all = read();

  const order = {
    id: orderId,
    name,
    phone,
    email,
    address,
    zip,
    paymentMethod,
    items: lockedItems,
    totalAmount: lockedTotal,         // Server-computed — cannot be spoofed
    currency: "INR",
    status: "pending_payment",
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.unshift(order);
  write(all);

  logger.info("HP_ORDER_PLACED", {
    orderId,
    name: name.slice(0, 3) + "***",
    phone: phone.slice(0, 4) + "****",
    itemCount: lockedItems.length,
    totalAmount: lockedTotal,
  });

  return { order };
}

export function getOrder(id) {
  return read().find((o) => o.id === id) || null;
}

export function getAllOrders() {
  return read();
}

export function updateOrderStatus(id, status) {
  const ALLOWED = ["pending_payment", "payment_confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
  if (!ALLOWED.includes(status)) return null;

  const all = read();
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  write(all);

  logger.info("HP_ORDER_STATUS_UPDATED", { id, status });
  return all[idx];
}
