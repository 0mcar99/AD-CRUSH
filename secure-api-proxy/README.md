# Secure Backend Proxy Architecture

This project provides a comprehensive, production-grade reference architecture designed to prevent sensitive third-party API keys (e.g., OpenAI, Stripe, Google Maps) from leaking through client-side environment files, compiled frontend bundles, or browser inspector sessions.

---

## The Security Problem
Modern frontend bundlers (Vite, Next.js, Webpack) automatically embed client-side environment variables (prefixed with `VITE_` or `NEXT_PUBLIC_`) straight into compiled JavaScript files. 

If your frontend makes direct requests to third-party endpoints:
1. **Secret Leakage:** Users can easily retrieve your secret keys via browser DevTools `Network` requests or by searching through compiled `.js` files.
2. **Financial/Abuse Risk:** Attackers can extract your keys and use them, leaving you with massive, unexpected monthly API bills or causing service suspensions.
3. **CORS Inflexibility:** Directly invoking APIs from browsers bypasses secure cross-origin validation policies.

---

## The Solution: Backend Proxy Architecture
This architecture completely isolates the secret key on the server-side. The browser client is completely unaware of the third-party endpoint, the secret key, or the raw error outputs.

```
+--------------------+               +-------------------------+               +---------------------+
|   Client Browser   |  (No Key!)    |   Secure Backend Proxy  |  (Reads .env) |  Third-Party API   |
|   (Vite/React/JS)  | ------------> | (Express / Next.js API) | ------------> | (OpenAI/Stripe/etc) |
+--------------------+               +-------------------------+               +---------------------+
                                                  |
                                                  v
                                     - CORS Origin Checking
                                     - Rate Limiting Middleware
                                     - Global Error Masking
```

---

## Folder Structure
```
secure-api-proxy/
├── client/
│   └── apiService.js       # Refactored Frontend Service (Before vs. After code)
├── nextjs/
│   └── route.js           # Native Next.js API Route Handler (App Router drop-in)
├── server/
│   ├── .env.example       # Example Environment variables file (Server-only)
│   └── proxy.js           # Production Express.js Proxy Server
└── README.md              # Setup, Testing Blueprint, and DevTools Audit Guide
```

---

## Quick Setup Instructions

### 1. Standalone Express Proxy Server Setup
1. Navigate to the `server/` directory:
   ```bash
   cd secure-api-proxy/server
   ```
2. Initialize npm and install the secure middleware suite:
   ```bash
   npm init -y
   npm install express cors express-rate-limit dotenv
   ```
3. Create your secure `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Populate your actual secrets in `.env`:
   ```env
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   OPENAI_API_KEY=sk-proj-ActualSecretAPIKeyHere
   ```
5. Spin up the secure gateway:
   ```bash
   node proxy.js
   ```

### 2. Next.js Native Serverless Route Setup
If you are integrating this directly into your Next.js application (like `flass`):
1. Copy [nextjs/route.js](file:///e:/MasterAdcrush/secure-api-proxy/nextjs/route.js) to your App Router path: `app/api/proxy/route.js`.
2. Add your server environment variables in your root-level `.env.local`:
   ```env
   # NOTICE: No "NEXT_PUBLIC_" prefix. The client will never see this.
   OPENAI_API_KEY=sk-proj-ActualSecretAPIKeyHere
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```
3. Next.js handles rate limiting internally in V8 memory cache and strictly limits origin access!

---

## 🧪 Comprehensive Testing Blueprint

Execute the following testing protocol to physically verify that the proxy functions correctly and protects your systems from CORS bypasses, flooding, and trace leaks.

### 1. Local Endpoint Verification (cURL Audit)

Open a terminal and run the following tests against your running Express proxy (`http://localhost:5000`) or Next.js route (`http://localhost:3000/api/proxy`).

#### Test A: Normal Request (Verifying Data Pipeline)
Verify the proxy receives client requests, successfully appends secrets on the server, fetches third-party data, and returns the sanitized payload.
```bash
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Explain backend proxies in one sentence."}]}'
```
* **Expected Result:** A clean HTTP `200 OK` response with a JSON body showing the chat choices, completely free of keys or raw OpenAI metadata.

#### Test B: CORS Security Verification (Origin Spoofing)
Verify that requests sent from unauthorized external origins are completely rejected.
```bash
curl -i -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://maliciousattacker.com" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```
* **Expected Result:** A blocked response (either rejected at the socket layer or returning an HTTP `403 Forbidden` / CORS failure header block).

#### Test C: Rate Limiting Verification (DDoS / Bill Inflation Audit)
Simulate an attacker spamming your API endpoint to verify the limiter triggers.
* **Express Proxy (100 Request cap):** 
  *(Tip: Set rate-limit window threshold down to `max: 3` in `proxy.js` temporarily for immediate testing)*.
  Run rapidly in sequence:
  ```bash
  curl -i -X POST http://localhost:5000/api/v1/chat -H "Content-Type: application/json" -d '{"messages":[]}'
  ```
* **Expected Result:** Subsequent requests trigger a clean HTTP `429 Too Many Requests` status code with rate-limit headers:
  ```json
  {
    "error": "Too many requests. Please slow down and try again later.",
    "status": 429
  }
  ```

#### Test D: Error Masking & Trace Leakage Audit
Verify that if the third-party API crashes or returns an error, the proxy captures it, logs full diagnostic details to the *server console*, but returns a completely sterilized error payload to the *client*.
* Send an invalid, malformed payload (e.g., leaving "messages" parameter blank, forcing a backend crash):
  ```bash
  curl -i -X POST http://localhost:5000/api/v1/chat \
    -H "Content-Type: application/json" \
    -d '{"corrupted": true}'
  ```
* **Expected Result:** The server logs the full trace internally. The client receives a sanitized HTTP `400` or `500` error:
  ```json
  {
    "error": "Invalid payload structure. \"messages\" array is required."
  }
  ```
  Or a global secure system catch-all:
  ```json
  {
    "error": "A secure system error occurred. Our engineers have been notified.",
    "referenceId": "d171d9d9-69f3-42eb-8288-bc1c9a622f99"
  }
  ```
  *(Notice: The reference ID is mapped to server logs so developers can trace the issue, but no server paths, API credentials, or internal stacks are leaked to the client).*

---

## 🔍 The DevTools Security Audit (How to Prove it Works)

Use this guide to inspect your frontend page to verify that the secret API key is **100% hidden and unretrievable**.

### Step 1: The Network Tab Audit (No Secrets on the Wire)
1. In Chrome/Firefox, navigate to your frontend application.
2. Press `F12` or right-click and select **Inspect** to open Developer Tools.
3. Switch to the **Network** tab, filter by `Fetch/XHR`.
4. Trigger your API transaction (e.g., clicking a chat submit button).
5. Locate the network request in the list:
   - **Verification 1:** Look at the request URL. It should target your proxy (e.g., `http://localhost:5000/api/v1/chat` or `/api/proxy`), **never** `https://api.openai.com/...` or `https://api.stripe.com/...`.
   - **Verification 2:** Click the request and inspect the **Headers** panel. Look at the `Request Headers`. Confirm there is **no** `Authorization: Bearer sk-...` or any token containing your secret key.
   - **Verification 3:** Inspect the **Payload** and **Response** tabs. Confirm they contain only your business JSON structure, with absolutely no secrets or keys.

### Step 2: Static Bundle Code Audit (No Secrets in Compiled Code)
When bundlers build for production, they convert source files into single-line minified `.js` chunks (assets). If you defined a key in client environment variables, it gets baked directly into these files. Let's inspect them:
1. In DevTools, go to the **Sources** tab (or **Debugger** in Firefox).
2. Look at the left sidebar under `Page` and expand `top/assets/` or your source folder.
3. Click on the main compiled `.js` bundle file.
4. Click the `{}` **Pretty Print** button at the bottom of the code viewer to format the minified code.
5. Press `Ctrl + F` (Windows) or `Cmd + F` (Mac) to open the search bar.
6. Search for:
   - `sk-proj` (or your specific API key prefix).
   - Your actual API key value (e.g., search for the first 8 characters of your API key).
   - The environment variable name (e.g., `OPENAI_API_KEY`).
7. **Verification:** The search should return **0 results**. If any match is found, it means the variable was prefixed with `NEXT_PUBLIC_` or `VITE_` or was hardcoded in your react components, causing the compiler to inject it. Refactor it to a secure server environment variable!

### Step 3: Bundle Analyzer / Source Map Audit
Make sure your production build does not bundle third-party SDKs that are no longer needed on the client:
1. Run your build tool with bundle visualizers (e.g. `@next/bundle-analyzer` or `rollup-plugin-visualizer` for Vite).
2. **Verification:** Confirm that heavy packages like `openai` or `stripe` are **absent** from the client bundles. They should only reside on the server-side, protecting client load speeds.
