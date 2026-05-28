/**
 * Next.js Secure Backend Proxy Route Handler (App Router)
 * File Location inside your Next.js app: /app/api/proxy/route.js
 * 
 * DESIGN PRINCIPLES:
 * 1. Server-Isolated Secrets: Next.js strictly hides all environment variables
 *    NOT prefixed with "NEXT_PUBLIC_" from the browser bundle. They are only readable on the server.
 * 2. Standalone Rate Limiting: Includes a built-in, lightweight Token Bucket rate-limiter
 *    designed for low-latency server memory operations.
 * 3. Origin Protection: Inspects requests and responds with strict CORS headers.
 * 4. Error Masking: Completely shields the client from backend stack traces or raw 3rd-party faults.
 */

import { NextResponse } from "next/server";

// ==========================================
// 1. BUILT-IN MEMORY RATE LIMITER
// ==========================================
// A lightweight token bucket implementation to prevent server overload and bill inflation.
class TokenBucketLimiter {
  constructor(maxTokens, refillRatePerMs) {
    this.maxTokens = maxTokens;
    this.refillRatePerMs = refillRatePerMs;
    this.buckets = new Map(); // IP -> { tokens, lastRefillTime }
  }

  checkLimit(ip) {
    const now = Date.now();
    let bucket = this.buckets.get(ip);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefillTime: now };
      this.buckets.set(ip, bucket);
    }

    // Refill tokens based on time elapsed
    const elapsed = now - bucket.lastRefillTime;
    const tokensToAdd = elapsed * this.refillRatePerMs;
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefillTime = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { allowed: true, remaining: Math.floor(bucket.tokens) };
    }

    return { allowed: false, remaining: 0 };
  }
}

// Configuration: 15 maximum burst tokens, refills at 1 token every 10 seconds (0.0001 tokens/ms)
const limiter = new TokenBucketLimiter(15, 0.0001);

// ==========================================
// 2. CORS DOMAIN CONFIGURATION
// ==========================================
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"]; // Customize to your domain list

function verifyOrigin(request) {
  const origin = request.headers.get("origin");
  
  // Allow server-to-server or development requests without origin header
  if (!origin && process.env.NODE_ENV === "development") {
    return true;
  }
  
  return ALLOWED_ORIGINS.includes(origin);
}

// Helper to construct standard CORS headers
function corsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": verifyOrigin(request) ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// ==========================================
// 3. OPTIONS HANDLER (CORS PREFLIGHT)
// ==========================================
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

// ==========================================
// 4. POST PROXY ROUTE HANDLER
// ==========================================
export async function POST(request) {
  const correlationId = crypto.randomUUID();
  
  // Retrieve Client IP Address safely in Next.js
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip";

  // CORS Verification
  if (!verifyOrigin(request)) {
    console.warn(`[SECURITY ALERT][Ref: ${correlationId}] CORS blocked request from unauthorized origin: ${request.headers.get("origin")}`);
    return NextResponse.json(
      { error: "Access Denied: CORS policy violation." },
      { status: 403, headers: corsHeaders(request) }
    );
  }

  // Rate Limiting Check
  const rateLimitResult = limiter.checkLimit(ip);
  if (!rateLimitResult.allowed) {
    console.warn(`[SECURITY ALERT][Ref: ${correlationId}] Rate limit triggered by IP: ${ip}`);
    return NextResponse.json(
      { error: "Too many requests. Please throttle your submission rate." },
      { 
        status: 429, 
        headers: {
          ...corsHeaders(request),
          "Retry-After": "10",
        } 
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    // Fail Fast: Validate Payload
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid body layout. "messages" array is required.' },
        { status: 400, headers: corsHeaders(request) }
      );
    }

    // Access Server-Isolated Env Key
    const secretApiKey = process.env.OPENAI_API_KEY;
    if (!secretApiKey) {
      console.error(`[CRITICAL ERROR][Ref: ${correlationId}] Server-side environment variable OPENAI_API_KEY is not defined.`);
      throw new Error("API Key Missing from server config.");
    }

    // Smart Mocking Mode for local testing/verification without paid keys
    if (secretApiKey.includes('testkey') || secretApiKey.includes('mock')) {
      console.log(`[${correlationId}] [MOCK MODE] Simulating OpenAI chat completion response in Next.js route.`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userMessage = body.messages[body.messages.length - 1]?.content || "";
      const simulatedText = `[Secure Proxy Simulated Response] Received: "${userMessage}". This is a mock response generated by your secure Next.js Backend Route Handler. The proxy successfully verified the CORS origin, validated rate-limits, and executed this logic on the server-side without exposing your environment keys to the browser!`;

      const mockPayload = {
        id: `chatcmpl-mock-${crypto.randomUUID()}`,
        model: body.model || 'gpt-4o-mini',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: simulatedText
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: userMessage.split(' ').length,
          completion_tokens: simulatedText.split(' ').length,
          total_tokens: userMessage.split(' ').length + simulatedText.split(' ').length
        }
      };

      console.log(`[${correlationId}] [MOCK MODE] Mock request completed successfully.`);
      return NextResponse.json(mockPayload, {
        status: 200,
        headers: corsHeaders(request)
      });
    }

    // Forward the Request to third-party endpoint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretApiKey}`,
      },
      body: JSON.stringify({
        model: body.model || "gpt-4o-mini",
        messages: body.messages.map((m) => ({ role: m.role, content: m.content })), // Input Sanity Check
        temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
      }),
    });

    const data = await response.json();

    // Check for Third-Party API failures
    if (!response.ok) {
      // Log full diagnosis internally for maintenance
      console.error(`[${correlationId}] Third-party API replied with error status ${response.status}:`, JSON.stringify(data));
      
      // Return a masked error message
      return NextResponse.json(
        { 
          error: "Third-party services failure. Please retry shortly.", 
          referenceId: correlationId 
        },
        { status: response.status, headers: corsHeaders(request) }
      );
    }

    // Return sanitized data payload (strip API metadata and secure endpoints)
    const sanitizedData = {
      id: data.id,
      model: data.model,
      choices: data.choices.map((c) => ({
        index: c.index,
        message: {
          role: c.message.role,
          content: c.message.content,
        },
        finish_reason: c.finish_reason,
      })),
      usage: data.usage,
    };

    return NextResponse.json(sanitizedData, {
      status: 200,
      headers: corsHeaders(request),
    });

  } catch (err) {
    // Log exception context securely on the server
    console.error(`[FATAL EXCEPTION][Ref: ${correlationId}]`, {
      message: err.message,
      stack: err.stack,
      ip,
    });

    // Send a totally masked sterile 500 error to browser
    return NextResponse.json(
      { 
        error: "A secure systems exception occurred. Reference code supplied.", 
        referenceId: correlationId 
      },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}
