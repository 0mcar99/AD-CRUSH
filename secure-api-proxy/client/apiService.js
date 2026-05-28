/**
 * Client-Side API Integration Refactor
 * File Location: /src/services/apiService.js (or equivalent service folder)
 * 
 * This file illustrates the EXACT architectural transition required to move from 
 * client-side key exposure to server-side isolation.
 */

// =========================================================================
// ❌ VULNERABLE APPROACH (BEFORE REFACTOR)
// =========================================================================
// This approach is INSECURE. The React/Vite/Next app directly invokes OpenAI.
// To run this, the developer was forced to expose the key to the browser 
// via NEXT_PUBLIC_ or VITE_ variables, which get compiled into plain JS bundles.
//
// import { Configuration, OpenAIApi } from "openai";
// 
// export async function vulnerableGetChatCompletion(userPrompt) {
//   // 🚨 DANGER: Exposed client-side environment variables!
//   // Any user can open DevTools, inspect the JS Bundle or go to the Network tab,
//   // and grab this key, incurring massive financial debt in hours.
//   const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; 
// 
//   const configuration = new Configuration({ apiKey });
//   const openai = new OpenAIApi(configuration);
// 
//   try {
//     const response = await openai.createChatCompletion({
//       model: "gpt-4",
//       messages: [{ role: "user", content: userPrompt }],
//     });
//     return response.data.choices[0].message.content;
//   } catch (error) {
//     // 🚨 DANGER: Raw stack trace or raw 3rd-party error payload leaked to client console!
//     console.error("OpenAI direct call failed:", error);
//     throw error;
//   }
// }


// =========================================================================
// ✅ SECURE REFACTORED APPROACH (AFTER REFACTOR)
// =========================================================================
// This approach is completely SECURE. The frontend removes the "openai" package
// dependency entirely, eliminating bundle size overhead. It calls our secure 
// Backend Proxy endpoint instead.
//
// 🔑 SECURITY WINS:
// 1. Zero API key references exist in client-side code, .env variables, or bundles.
// 2. Heavy 3rd-party dependencies are removed from frontend bundles, shrinking bundle size.
// 3. System errors are cleanly masked; users only see correlation IDs.

// Define proxy URLs (Local dev vs Production)
const PROXY_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.yourdomain.com' // Production Proxy Domain
  : 'http://localhost:5000';    // Local Express Proxy (or use '/api/proxy' for native Next.js router)

/**
 * Sends chat completion requests to the secure backend proxy.
 * @param {Array<{role: string, content: string}>} messages - Array of message objects.
 * @param {string} [model="gpt-4o-mini"] - Model designation.
 * @param {number} [temperature=0.7] - Model temperature.
 * @returns {Promise<Object>} - Clean, key-free sanitized payload from the server.
 */
export async function getChatCompletion(messages, model = "gpt-4o-mini", temperature = 0.7) {
  
  // Clean payload validation
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Client validation error: Messages must be a valid array.");
  }

  // Target either our Standalone Proxy or Next.js Native Proxy Endpoint
  const targetUrl = `${PROXY_BASE_URL}/api/v1/chat`; // Or '/api/proxy' for next.js internal proxy
  
  console.log(`[API Service] Transferring request securely through backend proxy at: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If your proxy is behind client authentication (e.g. JWT session cookies or auth token):
        // "Authorization": `Bearer ${sessionToken}` 
      },
      body: JSON.stringify({
        messages,
        model,
        temperature
      })
    });

    const data = await response.json();

    // Handle Client-facing errors safely
    if (!response.ok) {
      if (response.status === 429) {
        // Handle rate limiting gracefully
        const errorMsg = "Rate limit exceeded. You are making too many requests. Please wait a moment before trying again.";
        console.warn(`[API Service][429] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      if (response.status === 403) {
        // Handle CORS / Domain validation failure
        const errorMsg = "Access Forbidden: Origin validation failed on proxy.";
        console.error(`[API Service][403] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Intercept general masked error payloads and display user-friendly warnings
      const correlationMsg = data.referenceId 
        ? ` (Support Ref: ${data.referenceId})` 
        : "";
      
      const errorMsg = `Server Error: ${data.error || "Request failed to process"}${correlationMsg}`;
      console.error(`[API Service][${response.status}] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Success! Return the clean, sanitized message payload
    console.log("[API Service] Data received securely via proxy wrapper.");
    return data;

  } catch (error) {
    // Intercept client network failures gracefully (e.g. proxy offline)
    if (error.message.includes("Failed to fetch")) {
      console.error("[API Service] Proxy is offline or unreachable.");
      throw new Error("Unable to connect to service gateway. Please check your network connection.");
    }
    
    // Bubble up normalized error messages
    throw error;
  }
}
export default {
  getChatCompletion
};
