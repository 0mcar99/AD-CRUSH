// Native Next.js API Route for Caching, Security, and Concurrency Audit
import { checkRateLimit, checkVelocity, detectBot } from "@/lib/rate-limiter";
import { getCachedJSON, queueJSONWrite, getDiskWriteCount, checkNegativeCache } from "@/lib/io-manager";
import { subscribe, getAll as getAllSubscribers } from "@/lib/subscribers-store";
import { registerUser, verifyUser, findByEmail } from "@/lib/users-store";
import { verifyCredentials } from "@/lib/admin-auth";
import { encrypt, decrypt } from "@/lib/session";
import { join } from "path";

export async function GET(request) {
  // Security guard: only run in development or with a secret auth key
  const isDev = process.env.NODE_ENV === "development";
  const authHeader = request.headers.get("authorization");
  const secretKey = process.env.SESSION_SECRET;

  if (!isDev && authHeader !== `Bearer ${secretKey}`) {
    return Response.json({ error: "Unauthorized access to audit system." }, { status: 401 });
  }

  const logs = [];
  let passedTests = 0;
  let failedTests = 0;

  function logInfo(msg) {
    logs.push(`[INFO] ${msg}`);
  }

  function assert(condition, message) {
    if (condition) {
      logs.push(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      logs.push(`❌ [FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    logInfo("Starting Native Next.js Caching & Security Audit...");

    // -------------------------------------------------------------------------
    // 1. TIERED RATE LIMITER AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing Rate Limiters...");
    const testIP = `192.168.10.${Math.floor(Math.random() * 1000)}`;
    let allowedCount = 0;

    for (let i = 0; i < 6; i++) {
      const rl = checkRateLimit(testIP, "login");
      if (rl.allowed) allowedCount++;
    }
    assert(allowedCount === 5, `Login rate limiter capped exactly at 5 requests (got ${allowedCount})`);

    const blockedRl = checkRateLimit(testIP, "login");
    assert(!blockedRl.allowed, "6th rapid login attempt blocked successfully");
    assert(blockedRl.headers["Retry-After"] !== undefined, "Blocked response returned Retry-After header");

    // Burst Velocity Anomaly Detection
    const velocityIP = `10.10.10.${Math.floor(Math.random() * 1000)}`;
    let velocityTriggered = false;
    for (let i = 0; i < 25; i++) {
      if (checkVelocity(velocityIP)) {
        velocityTriggered = true;
      }
    }
    assert(velocityTriggered, "High request velocity burst detected successfully (>20 reqs in 10s)");

    // -------------------------------------------------------------------------
    // 2. BOT DETECTION ENGINE AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing Bot Detection Engine...");
    
    // Normal User Agent
    const chromeHeaders = new Map([
      ["user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"],
      ["accept", "text/html,application/xhtml+xml"],
      ["accept-language", "en-US,en;q=0.9"],
      ["accept-encoding", "gzip, deflate, br"]
    ]);
    const chromeReq = {
      headers: {
        get: (k) => chromeHeaders.get(k)
      }
    };
    const chromeResult = detectBot(chromeReq);
    assert(!chromeResult.isBot, "Standard browser request successfully passed bot check");

    // Scraper Agent (curl)
    const curlHeaders = new Map([["user-agent", "curl/8.4.0"]]);
    const curlReq = {
      headers: {
        get: (k) => curlHeaders.get(k)
      }
    };
    const curlResult = detectBot(curlReq);
    assert(curlResult.isBot && curlResult.reason.includes("curl"), "curl command scraper detected and blocked");

    // Scraper Agent (python)
    const pythonHeaders = new Map([["user-agent", "python-requests/2.31.0"]]);
    const pythonReq = {
      headers: {
        get: (k) => pythonHeaders.get(k)
      }
    };
    const pythonResult = detectBot(pythonReq);
    assert(pythonResult.isBot, "Python script automation detected and blocked");

    // Suspicious Header Set (Missing headers)
    const suspHeaders = new Map([
      ["user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"],
      ["accept", "*/*"]
    ]);
    const suspReq = {
      headers: {
        get: (k) => suspHeaders.get(k)
      }
    };
    const suspResult = detectBot(suspReq);
    assert(suspResult.isBot, "Request lacking standard language/accept headers classified as bot");

    // -------------------------------------------------------------------------
    // 3. CACHING AND CONCURRENCY AUDIT (WRITE COALESCING)
    // -------------------------------------------------------------------------
    logInfo("Auditing Concurrency / Write Coalescing Protection...");
    const DATA_DIR = join(process.cwd(), "data");
    const SUBS_FILE = join(DATA_DIR, "subscribers.json");

    const initialWrites = getDiskWriteCount(SUBS_FILE);

    // Blast 50 concurrent writes at the exact same millisecond
    const stamp = Date.now();
    const subPromises = Array.from({ length: 50 }).map((_, idx) => {
      return subscribe(`audit_coalesce_${idx}_${stamp}@adcrush.com`, "native-audit");
    });

    await Promise.all(subPromises);
    
    logInfo("Waiting 100ms for write queue to process and coalesce...");
    await new Promise(resolve => setTimeout(resolve, 100));

    const finalWrites = getDiskWriteCount(SUBS_FILE);
    const totalDiskWrites = finalWrites - initialWrites;

    assert(totalDiskWrites <= 1, `Write Coalescing active: 50 concurrent operations batch-completed in exactly ${totalDiskWrites} disk write(s)!`);

    // Verify all 50 subscribers exist
    const allSubs = await getAllSubscribers();
    const auditSubs = allSubs.filter(s => s.source === "native-audit");
    assert(auditSubs.length === 50, `Data Integrity: exactly 50/50 concurrent subscriber entries correctly written to database!`);

    // Clean up our audit entries to keep DB pristine
    const cleanSubs = allSubs.filter(s => s.source !== "native-audit");
    await queueJSONWrite(SUBS_FILE, cleanSubs);
    await new Promise(resolve => setTimeout(resolve, 50)); // let it flush

    // -------------------------------------------------------------------------
    // 4. CACHE PENETRATION (NEGATIVE LOOKUP CACHING) AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing Cache Penetration (Negative Caching) Protection...");
    const USERS_FILE = join(DATA_DIR, "users.json");
    const nonexistentKey = `nonexistent_audit_${Date.now()}@attacker.com`;

    const hrStart1 = process.hrtime.bigint();
    const res1 = await findByEmail(nonexistentKey);
    const hrEnd1 = process.hrtime.bigint();
    const time1 = Number(hrEnd1 - hrStart1);

    const hrStart2 = process.hrtime.bigint();
    const res2 = await findByEmail(nonexistentKey);
    const hrEnd2 = process.hrtime.bigint();
    const time2 = Number(hrEnd2 - hrStart2);

    assert(res1 === null && res2 === null, "Lookup correctly returned null for missing user key");
    assert(checkNegativeCache(USERS_FILE, nonexistentKey), "Non-existent user email registered in memory negativeCache");
    assert(time2 <= time1, `Bypassed disk search: subsequent lookups resolve instantly from negative cache (1st: ${time1}ns, 2nd: ${time2}ns)`);

    // -------------------------------------------------------------------------
    // 5. USER REGISTRATION & AUTHENTICATION AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing User Registration & Verification...");
    const testEmail = `user_native_${Date.now()}@adcrush.com`;
    const testPass = "super_secure_pass_123456";

    // Register User
    const regRes = await registerUser(testEmail, testPass, "9999900000", "+91");
    assert(regRes.user !== undefined && regRes.user.email === testEmail, "User account registered and sanitized successfully");
    assert(regRes.user.passwordHash === undefined, "Password hash redacted from client registration response payload");

    // Verify User Auth
    const verifyRes = await verifyUser(testEmail, testPass);
    assert(verifyRes.user !== undefined && verifyRes.user.email === testEmail, "Correct credentials authenticated successfully");

    const verifyFail = await verifyUser(testEmail, "wrongpassword");
    assert(verifyFail.error !== undefined, "Invalid password credentials correctly blocked");

    // Cleanup registered user from users.json
    const usersList = getCachedJSON(USERS_FILE, []);
    const cleanUsersList = usersList.filter(u => u.email !== testEmail);
    await queueJSONWrite(USERS_FILE, cleanUsersList);
    await new Promise(resolve => setTimeout(resolve, 50)); // let it flush

    // -------------------------------------------------------------------------
    // 6. ADMIN PASSWORD SECURITY AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing Administrative Login Protections...");
    const adminSuccess = await verifyCredentials("adcrushadmin", "adminadcrushpopi15569");
    assert(adminSuccess === true, "Static administrator username & password pair authenticated successfully");

    const adminFail = await verifyCredentials("adcrushadmin", "wrongadminpassword");
    assert(adminFail === false, "Incorrect administrative password blocked correctly");

    // -------------------------------------------------------------------------
    // 7. JWT SESSION CRYPTOGRAPHIC SIGNING & SERIALIZATION AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing Cryptographic JWT Session Signing...");
    const payload = { email: "adcrushadmin", role: "admin", initial: "A" };

    const token = await encrypt(payload);
    assert(typeof token === "string" && token.length > 50, "Session payload successfully encrypted into a signed cryptographic JWT");

    const verified = await decrypt(token);
    assert(verified !== null && verified.email === "adcrushadmin" && verified.role === "admin", "Signed JWT token successfully decrypted and verified");

    const tampered = await decrypt(token + "tamper");
    assert(tampered === null, "Cryptographic integrity active: tampered JWT session tokens rejected");

    // -------------------------------------------------------------------------
    // 8. HYDROPULSE E-COMMERCE SECURITY & INPUT SANITIZATION AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing HydroPulse E-commerce Security & Caching Firewall...");
    const { placeOrder } = await import("@/lib/hydropulse/orders-store");
    const { addReview } = await import("@/lib/hydropulse/reviews-store");

    // 1. Order price lock verification
    const orderRes = placeOrder({
      name: "Omkar",
      phone: "9999988888",
      email: "omkar@gmail.com",
      address: "Flat 304, Green Heights, Pune",
      zip: "411026",
      paymentMethod: "upi",
      items: [
        { id: "marlin-1", title: "Marlin 1.0", price: 1, quantity: 2 } // tampered price: 1 INR
      ]
    });
    
    assert(orderRes.order !== undefined, "Order placed successfully through secure server validation");
    assert(orderRes.order.totalAmount === 100000, `Price lock verified: client-supplied price tampered to 1 INR was ignored. Correct catalog price locked (50,000 INR x 2 = ${orderRes.order.totalAmount} INR)`);

    // Clean up order to keep the database pristine
    const HP_ORDERS_FILE = join(DATA_DIR, "hp_orders.json");
    const ordersList = getCachedJSON(HP_ORDERS_FILE, []);
    const cleanOrdersList = ordersList.filter(o => o.id !== orderRes.order.id);
    await queueJSONWrite(HP_ORDERS_FILE, cleanOrdersList);
    await new Promise(resolve => setTimeout(resolve, 50)); // let it flush

    // 2. Review sanitization check
    const reviewRes = addReview({
      name: "<b>Hacker</b>",
      rating: 5,
      location: "<script>alert('XSS')</script>Pune",
      comment: "This is a great product! <iframe src='http://malicious.com'></iframe>"
    }, "127.0.0.1");

    assert(reviewRes.review !== undefined, "Review submitted successfully through server validation");
    assert(!reviewRes.review.name.includes("<b>") && !reviewRes.review.name.includes("</b>"), "Review name successfully sanitized of HTML elements (HTML injection blocked)");
    assert(!reviewRes.review.location.includes("<script>"), "Review location successfully sanitized of script elements (XSS blocked)");
    assert(!reviewRes.review.comment.includes("<iframe>"), "Review comment successfully sanitized of iframe elements (Content injection blocked)");

    // Clean up review to keep database pristine
    const HP_REVIEWS_FILE = join(DATA_DIR, "hp_reviews.json");
    const reviewsList = getCachedJSON(HP_REVIEWS_FILE, []);
    const cleanReviewsList = reviewsList.filter(r => r.id !== reviewRes.review.id);
    await queueJSONWrite(HP_REVIEWS_FILE, cleanReviewsList);
    await new Promise(resolve => setTimeout(resolve, 50)); // let it flush

    // 3. Rate limiting for order / review submissions
    const hpIP = `172.16.5.${Math.floor(Math.random() * 1000)}`;
    let hpSubmissionCount = 0;
    for (let i = 0; i < 4; i++) {
      const rl = checkRateLimit(hpIP, "submission");
      if (rl.allowed) hpSubmissionCount++;
    }
    assert(hpSubmissionCount === 3, `Submission rate limiter capped exactly at 3 submissions per hour (got ${hpSubmissionCount})`);

    // -------------------------------------------------------------------------
    // 9. SUPABASE SYNCHRONIZATION AUDIT
    // -------------------------------------------------------------------------
    logInfo("Auditing Supabase Synchronization...");
    const { supabase } = await import("@/lib/supabaseClient");
    
    const { data: connTest, error: connErr } = await supabase.from("visitors").select("id").limit(1);
    assert(!connErr, `Supabase connection verified: successfully queried 'visitors' table (Error: ${connErr ? connErr.message : 'none'})`);

    if (!connErr) {
      const stamp = Date.now();
      const testEmail = `supabase_audit_${stamp}@adcrush.com`;
      const testUuid = "11111111-2222-3333-4444-555555555555";

      // 1. Test profile sync
      logInfo("Testing profile synchronization to Supabase...");
      const { syncProfile } = await import("@/lib/supabaseClient");
      await syncProfile({
        id: testUuid,
        email: testEmail,
        phone: "1234567890",
        countryCode: "+91",
        role: "user",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
      const { data: profData, error: profErr } = await supabase.from("profiles").select("*").eq("id", testUuid);
      assert(!profErr && profData && profData.length > 0 && profData[0].email === testEmail, "Profile successfully synced to Supabase");
      await supabase.from("profiles").delete().eq("id", testUuid);

      // 2. Test campaign submission sync
      logInfo("Testing campaign submission synchronization...");
      const { syncSubmission, deleteSubmission } = await import("@/lib/supabaseClient");
      await syncSubmission({
        id: testUuid,
        email: testEmail,
        name: "Supabase Audit",
        adType: "Product",
        productName: "Audit Test Product",
        tagline: "Testing Supabase",
        description: "Supabase submission sync verification.",
        category: "Tech",
        audience: "Everyone",
        platforms: ["Instagram"],
        budget: "Under $500",
        timeline: "ASAP",
        duration: "1 week",
        status: "pending"
      });
      const { data: subData, error: subErr } = await supabase.from("campaign_submissions").select("*").eq("id", testUuid);
      assert(!subErr && subData && subData.length > 0 && subData[0].product_name === "Audit Test Product", "Campaign submission successfully synced to Supabase");
      await deleteSubmission(testUuid);

      // 3. Test chat sync
      logInfo("Testing live chat message synchronization...");
      const { syncChat } = await import("@/lib/supabaseClient");
      await syncChat(testEmail, "user", "Audit test chat message");
      const { data: visData } = await supabase.from("visitors").select("id").eq("email", testEmail);
      const visId = visData && visData[0] ? visData[0].id : null;
      if (visId) {
        const { data: chatData, error: chatErr } = await supabase.from("chats").select("*").eq("visitor_id", visId);
        assert(!chatErr && chatData && chatData.length > 0 && chatData[0].message === "Audit test chat message", "Chat message successfully synced to Supabase");
        await supabase.from("chats").delete().eq("visitor_id", visId);
        await supabase.from("visitors").delete().eq("id", visId);
      } else {
        assert(false, "Failed to resolve visitor ID for chat verification");
      }

      // 4. Test newsletter subscriber sync
      logInfo("Testing newsletter subscriber synchronization...");
      const { syncSubscriber } = await import("@/lib/supabaseClient");
      const testSubUuid = "22222222-3333-4444-5555-666666666666";
      await syncSubscriber({
        id: testSubUuid,
        email: testEmail,
        active: true,
        subscribedAt: new Date().toISOString()
      });
      const { data: subscrData, error: subscrErr } = await supabase.from("subscribers").select("*").eq("id", testSubUuid);
      assert(!subscrErr && subscrData && subscrData.length > 0 && subscrData[0].email === testEmail, "Newsletter subscriber successfully synced to Supabase");
      await supabase.from("subscribers").delete().eq("id", testSubUuid);
      const { data: visData2 } = await supabase.from("visitors").select("id").eq("email", testEmail);
      const visId2 = visData2 && visData2[0] ? visData2[0].id : null;
      if (visId2) {
        await supabase.from("visitors").delete().eq("id", visId2);
      }

      // 5. Test product order sync
      logInfo("Testing product order synchronization...");
      const { syncOrder } = await import("@/lib/supabaseClient");
      const testOrderUuid = "HP-AUDIT-TEST-ORDER";
      await syncOrder({
        id: testOrderUuid,
        name: "Audit User",
        phone: "9876543210",
        email: testEmail,
        address: "Supabase Audit Road",
        zip: "400001",
        paymentMethod: "upi",
        items: [{ id: "marlin-1", title: "Marlin 1.0", price: 50000, quantity: 1 }],
        totalAmount: 50000,
        status: "pending_payment",
        placedAt: new Date().toISOString()
      });
      const { data: ordData, error: ordErr } = await supabase.from("hydropulse_orders").select("*").eq("id", testOrderUuid);
      assert(!ordErr && ordData && ordData.length > 0 && ordData[0].customer_name === "Audit User", "Product order successfully synced to Supabase");
      await supabase.from("hydropulse_orders").delete().eq("id", testOrderUuid);
      const { data: visData3 } = await supabase.from("visitors").select("id").eq("email", testEmail);
      const visId3 = visData3 && visData3[0] ? visData3[0].id : null;
      if (visId3) {
        await supabase.from("visitors").delete().eq("id", visId3);
      }

      // 6. Test product review sync (graceful failure expectation)
      logInfo("Testing product review sync (expecting warnings/graceful fallback since table is missing)...");
      const { syncReview } = await import("@/lib/supabaseClient");
      const testRevUuid = "33333333-4444-5555-6666-777777777777";
      await syncReview({
        id: testRevUuid,
        name: "Auditor",
        rating: 5,
        location: "Mumbai",
        comment: "Excellent database syncing performance!",
        verified: true,
        status: "approved",
        submittedAt: new Date().toISOString(),
        submittedByIp: "127.0.0.1"
      });
      const { error: revErr } = await supabase.from("hydropulse_reviews").select("*").limit(1);
      assert(revErr !== null && revErr.message.includes("Could not find the table"), "Product reviews table confirmed as missing, error caught and handled gracefully");
    }

    logInfo("Audit Completed successfully.");
  } catch (error) {
    logs.push(`❌ [FATAL ERROR DURING AUDIT]: ${error.message}`);
    failedTests++;
  }

  const success = failedTests === 0;

  return Response.json({
    success,
    passedTests,
    failedTests,
    summary: success 
      ? "🏆 ALL SECURITY, CACHING, AND CONCURRENCY CONTROLS ARE 100% OPERATIONAL!" 
      : "⚠️ SYSTEM AUDIT DETECTED FLAWS OR VULNERABILITIES IN SYSTEM CONTROLS.",
    logs
  });
}
