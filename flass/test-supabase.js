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
      console.warn("⚠️ 'visitors' table error:", visitorsError.message);
    } else {
      console.log("✅ 'visitors' table queried successfully!");
    }

    // 3. Query 'chats' table
    console.log("\n2. Querying 'chats' table...");
    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);

    if (chatsError) {
      console.warn("⚠️ 'chats' table error:", chatsError.message);
    } else {
      console.log("✅ 'chats' table queried successfully!");
    }

    // 4. Query 'profiles' table
    console.log("\n3. Querying 'profiles' table...");
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    if (profilesError) {
      console.warn("⚠️ 'profiles' table error:", profilesError.message);
    } else {
      console.log("✅ 'profiles' table queried successfully!");
    }

    // 5. Query 'campaign_submissions' table
    console.log("\n4. Querying 'campaign_submissions' table...");
    const { data: submissionsData, error: submissionsError } = await supabase
      .from('campaign_submissions')
      .select('*')
      .limit(1);
    if (submissionsError) {
      console.warn("⚠️ 'campaign_submissions' table error:", submissionsError.message);
    } else {
      console.log("✅ 'campaign_submissions' table queried successfully!");
    }

    // 6. Query 'subscribers' table
    console.log("\n5. Querying 'subscribers' table...");
    const { data: subscribersData, error: subscribersError } = await supabase
      .from('subscribers')
      .select('*')
      .limit(1);
    if (subscribersError) {
      console.warn("⚠️ 'subscribers' table error:", subscribersError.message);
    } else {
      console.log("✅ 'subscribers' table queried successfully!");
    }

    // 7. Query 'hydropulse_orders' table
    console.log("\n6. Querying 'hydropulse_orders' table...");
    const { data: ordersData, error: ordersError } = await supabase
      .from('hydropulse_orders')
      .select('*')
      .limit(1);
    if (ordersError) {
      console.warn("⚠️ 'hydropulse_orders' table error:", ordersError.message);
    } else {
      console.log("✅ 'hydropulse_orders' table queried successfully!");
    }

    // 8. Query 'hydropulse_reviews' table
    console.log("\n7. Querying 'hydropulse_reviews' table...");
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('hydropulse_reviews')
      .select('*')
      .limit(1);
    if (reviewsError) {
      console.warn("⚠️ 'hydropulse_reviews' table error:", reviewsError.message);
    } else {
      console.log("✅ 'hydropulse_reviews' table queried successfully!");
    }

    console.log("\n📡 Supabase connectivity test completed.");
  } catch (err) {
    console.error("❌ FATAL CONNECTION ERROR:", err.message);
  }
}

runTest();
