/**
 * Unified Diagnostics Doctor Script (Node.js)
 * 
 * DESIGN PRINCIPLE:
 * Strictly non-destructive. Programmatically queries local services (Express Proxy)
 * and audits GEO files (llms.txt, mirrors) to verify that everything is running perfectly.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log(`====================================================================`);
console.log(`  SYSTEM DIAGNOSTIC DOCTOR: Crash Publishing & Anti-Gravity Audit   `);
console.log(`  Auditing active processes and passive GEO systems...              `);
console.log(`====================================================================`);

let auditsPassed = 0;
let auditsFailed = 0;

function auditLog(success, title, details = '') {
  if (success) {
    console.log(`  ✅ [ACTIVE] ${title}`);
    if (details) console.log(`              -> ${details}`);
    auditsPassed++;
  } else {
    console.error(`  ❌ [FAILED] ${title}`);
    if (details) console.error(`              -> Error: ${details}`);
    auditsFailed++;
  }
}

// ==========================================
// 1. AUDIT PHYSICAL GEO FILES
// ==========================================
console.log(`\n🔹 PHASE 1: Passive GEO AI-SEO Files Audit`);

const llmsPath = path.resolve(__dirname, '../public/llms.txt');
const mirrorPath = path.resolve(__dirname, '../public/mirrors/architecture.md');
const schemaPath = path.resolve(__dirname, '../components/semanticSchema.html');

auditLog(fs.existsSync(llmsPath), 'Root AI Executive Summary (llms.txt) presence', 
  fs.existsSync(llmsPath) ? `Size: ${fs.statSync(llmsPath).size} bytes` : 'File not found');

auditLog(fs.existsSync(mirrorPath), 'Markdown mirror (mirrors/architecture.md) presence', 
  fs.existsSync(mirrorPath) ? `Size: ${fs.statSync(mirrorPath).size} bytes` : 'File not found');

auditLog(fs.existsSync(schemaPath), 'Nested JSON-LD Schema (semanticSchema.html) presence', 
  fs.existsSync(schemaPath) ? `Size: ${fs.statSync(schemaPath).size} bytes` : 'File not found');

// ==========================================
// 2. AUDIT SERVER ROUTING HEADERS CONFIG
// ==========================================
console.log(`\n🔹 PHASE 2: Server Routing Configuration Audit`);

const vercelPath = path.resolve(__dirname, '../config/vercel.json');
const netlifyPath = path.resolve(__dirname, '../config/netlify.toml');
const htaccessPath = path.resolve(__dirname, '../config/.htaccess');

auditLog(fs.existsSync(vercelPath), 'Vercel Deployment Rules (vercel.json) presence');
auditLog(fs.existsSync(netlifyPath), 'Netlify Redirect Headers (netlify.toml) presence');
auditLog(fs.existsSync(htaccessPath), 'Apache Directives (.htaccess) presence');

// ==========================================
// 3. AUDIT RUNNING SERVICES (EXPRESS PROXY ON PORT 5000)
// ==========================================
console.log(`\n🔹 PHASE 3: Active Express Proxy Server Audit`);

const testPayload = JSON.stringify({
  messages: [{ role: 'user', content: 'Doctor audit ping test.' }]
});

const reqOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5000', // Allowed origin
    'Content-Length': Buffer.byteLength(testPayload)
  }
};

const req = http.request(reqOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      const serverRunning = res.statusCode === 200;
      auditLog(serverRunning, `Express Proxy API Ping (statusCode: ${res.statusCode})`, 
        serverRunning ? `Successfully returned Smart Mock response.` : `Server returned: ${res.statusMessage}`);
      
      // Verify Rate Limiting Headers
      const hasRateLimit = res.headers['ratelimit-limit'] !== undefined || res.headers['x-ratelimit-limit'] !== undefined;
      const rateRemaining = res.headers['ratelimit-remaining'] || 'N/A';
      auditLog(hasRateLimit, `Proxy Rate Limiting Headers Attached`, `Remaining capacity: ${rateRemaining}`);

      // Verify CORS Headers
      const corsMatch = res.headers['access-control-allow-origin'] === 'http://localhost:5000';
      auditLog(corsMatch, `Proxy CORS Origin headers successfully enforced`, `Allowed Origin: ${res.headers['access-control-allow-origin']}`);

      printSummary();
    } catch (err) {
      auditLog(false, 'Express Proxy API Response Parser', `Failed to parse response body: ${err.message}`);
      printSummary();
    }
  });
});

req.on('error', (err) => {
  auditLog(false, 'Express Proxy API Connection Check', `Proxy server offline on port 5000: ${err.message}`);
  printSummary();
});

req.write(testPayload);
req.end();

// ==========================================
// 4. PRINT DIAGNOSTICS REPORT CARD
// ==========================================
function printSummary() {
  console.log(`\n====================================================================`);
  console.log(`  DIAGNOSTICS REPORT CARD`);
  console.log(`  Tests Audited: ${auditsPassed + auditsFailed}`);
  console.log(`  Passed Checks: ${auditsPassed}`);
  console.log(`  Failed Checks: ${auditsFailed}`);
  console.log(`====================================================================`);
  
  if (auditsFailed === 0) {
    console.log(`  🏆 SYSTEM DIAGNOSIS: ALL PROCESSES AND CODES ARE 100% OPERATIONAL!`);
  } else {
    console.warn(`  ⚠️  SYSTEM DIAGNOSIS: WARNING - DETECTED BLOCKED PROCESSES OR ASSETS.`);
  }
  console.log(`====================================================================\n`);
}
