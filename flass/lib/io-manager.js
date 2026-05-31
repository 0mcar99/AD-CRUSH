import { existsSync, mkdirSync, readFileSync } from "fs";
import { writeFile, rename } from "fs/promises";
import { dirname } from "path";
import { logger } from "./logger.js";

// In-memory cache for fast O(1) synchronous reads
const cache = new Map();

// Serial processing queues per file path to prevent concurrent write collisions
const queues = new Map();

// Pending write timeouts per file path for Write Coalescing (de-bouncing)
const writeSchedulers = new Map();

// Disk write statistics for validation metrics
const diskWriteStats = new Map();

// Negative lookup cache for Cache Penetration prevention (key: "filePath:queryKey" -> expiryTimestamp)
const negativeCache = new Map();

/**
 * Ensures the target directory exists
 * @param {string} filePath 
 */
function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Synchronously retrieves data from cache. If cache is empty,
 * performs a one-time disk read to bootstrap the cache in memory.
 * This guarantees 100% backwards compatibility for synchronous APIs.
 * 
 * @param {string} filePath 
 * @param {*} defaultVal 
 * @returns {*} The cached or loaded JSON data
 */
export function getCachedJSON(filePath, defaultVal = []) {
  if (cache.has(filePath)) {
    return cache.get(filePath);
  }

  try {
    ensureDir(filePath);
    if (!existsSync(filePath)) {
      cache.set(filePath, defaultVal);
      return defaultVal;
    }
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    cache.set(filePath, parsed);
    return parsed;
  } catch (err) {
    logger.error("IO_BOOTSTRAP_ERROR", { filePath, error: err.message });
    cache.set(filePath, defaultVal);
    return defaultVal;
  }
}

/**
 * Updates the in-memory cache instantly and appends an atomic,
 * coalesced background write task to the file's serial queue.
 * Resolves the Thundering Herd / Cache Stampede problem by batching 
 * concurrent writes into a single high-efficiency atomic disk write.
 * 
 * @param {string} filePath 
 * @param {*} data 
 */
export function queueJSONWrite(filePath, data) {
  // 1. Instantly update cache in memory so subsequent reads are fresh
  cache.set(filePath, data);

  // 2. Coalesce concurrent writes within a 50ms window
  if (writeSchedulers.has(filePath)) {
    return writeSchedulers.get(filePath).promise;
  }

  // Initialize queue head if missing
  if (!queues.has(filePath)) {
    queues.set(filePath, Promise.resolve());
  }

  let resolveWrite;
  const promise = new Promise((resolve) => {
    resolveWrite = resolve;
  });

  const timeoutId = setTimeout(() => {
    writeSchedulers.delete(filePath);

    const currentQueue = queues.get(filePath);
    const nextQueue = currentQueue.then(async () => {
      try {
        ensureDir(filePath);
        const tmpPath = `${filePath}.tmp`;
        // Grab latest cached data at write time
        const latestData = cache.get(filePath);
        const jsonString = JSON.stringify(latestData, null, 2);

        await writeFile(tmpPath, jsonString, "utf-8");
        await rename(tmpPath, filePath);

        // Increment stats for performance auditing
        const currentCount = diskWriteStats.get(filePath) || 0;
        diskWriteStats.set(filePath, currentCount + 1);
      } catch (err) {
        logger.error("IO_ASYNC_WRITE_ERROR", { filePath, error: err.message });
      }
    });

    queues.set(filePath, nextQueue);
    nextQueue.then(resolveWrite);
  }, 50); // 50ms coalescing window

  writeSchedulers.set(filePath, { timeoutId, promise });
  return promise;
}

/**
 * Check disk write count (for load test verification)
 */
export function getDiskWriteCount(filePath) {
  return diskWriteStats.get(filePath) || 0;
}

/* ─── Cache Penetration (Negative Lookup Caching) ─── */

/**
 * Check if a non-existent key lookup is temporarily cached
 * @returns {boolean}
 */
export function checkNegativeCache(filePath, key) {
  const cacheKey = `${filePath}:${key}`;
  const expiry = negativeCache.get(cacheKey);
  if (expiry && Date.now() < expiry) {
    return true;
  }
  if (expiry) negativeCache.delete(cacheKey); // clean expired
  return false;
}

/**
 * Temporarily cache a verified non-existent lookup key
 */
export function setNegativeCache(filePath, key, ttlMs = 15000) {
  const cacheKey = `${filePath}:${key}`;
  negativeCache.set(cacheKey, Date.now() + ttlMs);
}

/**
 * Clear a negative cache entry (e.g. when a user is successfully registered)
 */
export function clearNegativeCache(filePath, key) {
  const cacheKey = `${filePath}:${key}`;
  negativeCache.delete(cacheKey);
}
