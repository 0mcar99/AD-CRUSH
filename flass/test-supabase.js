/* test-supabase.js — Test Supabase connection using active environment variables */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually parse .env.local variables
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ ERROR: .env.local file not found at " + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    // Strip optional quotes
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ ERROR: Supabase URL or Anon Key is missing in .env.local!");
  process.exit(1);
}

console.log("📡 Attempting connection to Supabase instance...");
console.log("🔗 URL:", url);
console.log("🔑 Anon Key preview:", key.slice(0, 15) + "...");

const supabase = createClient(url, key);

async function runTest() {
  try {
    // 2. Query 'visitors' table
    console.log("\n1. Querying 'visitors' table...");
    const { data: visitorsData, error: visitorsError } = await supabase
      .from('visitors')
      .select('*')
      .limit(1);

    if (visitorsError) {
      console.warn("⚠️ 'visitors' table query completed with error status:", visitorsError.message);
    } else {
      console.log("✅ 'visitors' table queried successfully! Records found:", visitorsData.length);
      if (visitorsData.length > 0) {
        console.log("   Sample Record:", JSON.stringify(visitorsData[0]));
      }
    }

    // 3. Query 'chats' table
    console.log("\n2. Querying 'chats' table...");
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);

    if (chatsError) {
      console.warn("⚠️ 'chats' table query completed with error status:", chatsError.message);
    } else {
      console.log("✅ 'chats' table queried successfully! Records found:", chatsData.length);
      if (chatsData.length > 0) {
        console.log("   Sample Record:", JSON.stringify(chatsData[0]));
      }
    }

    console.log("\n📡 Supabase connectivity test completed.");
  } catch (err) {
    console.error("❌ FATAL CONNECTION ERROR:", err.message);
  }
}

runTest();
