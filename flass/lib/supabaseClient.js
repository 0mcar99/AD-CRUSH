import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in environment files.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==========================================
// GUEST LIFECYCLE SYNC HELPERS (WITH GRACEFUL FALLBACKS)
// ==========================================

// 1. Sync User / Admin Profile
export async function syncProfile(user) {
  if (!user) return;
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        phone: user.phone || null,
        country_code: user.countryCode || '+91',
        role: user.role || 'user',
        created_at: user.createdAt || new Date().toISOString(),
        last_login_at: user.lastLoginAt || null,
        password_hash: user.passwordHash || null
      });
    if (error) {
      console.warn("⚠️ Supabase Sync: 'profiles' table not available or RLS blocked. Run setup script.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Profile Error:", err.message);
  }
}

// 2. Sync Campaign Wizard Submissions
export async function syncSubmission(entry) {
  if (!entry) return;
  try {
    // Upsert visitor to get ID
    const { data } = await supabase
      .from('visitors')
      .upsert({ email: entry.email }, { onConflict: 'email' })
      .select('id');
      
    const visitorId = data && data[0] ? data[0].id : null;

    const { error } = await supabase
      .from('campaign_submissions')
      .upsert({
        id: entry.id,
        visitor_id: visitorId,
        email: entry.email,
        name: entry.name,
        ad_type: entry.adType,
        product_name: entry.productName,
        tagline: entry.tagline,
        description: entry.description,
        category: entry.category,
        audience: entry.audience,
        platforms: entry.platforms,
        budget: entry.budget,
        timeline: entry.timeline,
        duration: entry.duration,
        website: entry.website || null,
        notes: entry.notes || null,
        status: entry.status || 'pending',
        admin_notes: entry.adminNotes || null,
        created_at: entry.createdAt || new Date().toISOString(),
        updated_at: entry.updatedAt || new Date().toISOString()
      });

    if (error) {
      console.warn("⚠️ Supabase Sync: 'campaign_submissions' table not available. Run setup script.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Submission Error:", err.message);
  }
}

// 3. Sync User & Admin Chats
export async function syncChat(email, role, text) {
  if (!email || !role || !text) return;
  try {
    const { data } = await supabase
      .from('visitors')
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' })
      .select('id');
      
    const visitorId = data && data[0] ? data[0].id : null;
    if (!visitorId) return;

    // Supports both the existing default 'chats' schema and custom models
    const { error } = await supabase
      .from('chats')
      .insert([
        { visitor_id: visitorId, sender: role, message: text }
      ]);

    if (error) {
      console.warn("⚠️ Supabase Sync: 'chats' table not available or RLS blocked. Run setup script.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Chat Error:", err.message);
  }
}

// 4. Sync Newsletter Subscribers
export async function syncSubscriber(entry) {
  if (!entry) return;
  try {
    const { data } = await supabase
      .from('visitors')
      .upsert({ email: entry.email }, { onConflict: 'email' })
      .select('id');
      
    const visitorId = data && data[0] ? data[0].id : null;

    const { error } = await supabase
      .from('subscribers')
      .upsert({
        id: entry.id,
        visitor_id: visitorId,
        email: entry.email,
        active: entry.active,
        subscribed_at: entry.subscribedAt || new Date().toISOString()
      });

    if (error) {
      console.warn("⚠️ Supabase Sync: 'subscribers' table not available. Run setup script.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Subscriber Error:", err.message);
  }
}

// 5. Sync HydroPulse Product Orders
export async function syncOrder(order) {
  if (!order) return;
  try {
    const { data } = await supabase
      .from('visitors')
      .upsert({ email: order.email || 'guest@adcrush.com' }, { onConflict: 'email' })
      .select('id');
      
    const visitorId = data && data[0] ? data[0].id : null;

    const { error } = await supabase
      .from('hydropulse_orders')
      .upsert({
        id: order.id,
        visitor_id: visitorId,
        customer_name: order.name,
        customer_phone: order.phone,
        customer_email: order.email || null,
        shipping_address: order.address,
        zip_code: order.zip,
        payment_method: order.paymentMethod,
        items: order.items,
        total_amount: order.totalAmount,
        status: order.status || 'pending_payment',
        placed_at: order.placedAt || new Date().toISOString()
      });

    if (error) {
      console.warn("⚠️ Supabase Sync: 'hydropulse_orders' table not available. Run setup script.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Order Error:", err.message);
  }
}

// 6. Sync HydroPulse Product Reviews
export async function syncReview(review) {
  if (!review) return;
  try {
    const { error } = await supabase
      .from('hydropulse_reviews')
      .upsert({
        id: review.id,
        reviewer_name: review.name,
        rating: review.rating,
        location: review.location || 'India',
        comment: review.comment,
        verified: review.verified || false,
        status: review.status || 'approved',
        submitted_at: review.submittedAt || new Date().toISOString(),
        ip_address: review.submittedByIp || '127.0.0.1'
      });

    if (error) {
      console.warn("⚠️ Supabase Sync: 'hydropulse_reviews' table not available. Run setup script.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Review Error:", err.message);
  }
}

// 7. Delete Campaign Wizard Submission
export async function deleteSubmission(id) {
  if (!id) return;
  try {
    const { error } = await supabase
      .from('campaign_submissions')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn("⚠️ Supabase Sync: Failed to delete submission on Supabase.", error.message);
    }
  } catch (err) {
    console.warn("⚠️ Supabase Sync Delete Submission Error:", err.message);
  }
}
