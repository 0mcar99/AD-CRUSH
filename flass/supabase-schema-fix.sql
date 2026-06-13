-- ============================================================
-- FLASS — Supabase Schema Fix v3 (FULLY SAFE — handles existing tables)
-- Fixes: "column does not exist" by adding missing columns first
-- Run in: https://supabase.com/dashboard/project/tiislxhobchtifrmpufi/sql
-- ============================================================

-- ─── 1. VISITORS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visitors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if table pre-existed
ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add UNIQUE constraint on email (required for upsert ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'visitors_email_key'
      AND conrelid = 'public.visitors'::regclass
  ) THEN
    ALTER TABLE public.visitors ADD CONSTRAINT visitors_email_key UNIQUE (email);
  END IF;
END $$;

-- ─── 2. PROFILES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  country_code  TEXT DEFAULT '+91',
  role          TEXT DEFAULT 'user',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  password_hash TEXT
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone         TEXT,
  ADD COLUMN IF NOT EXISTS country_code  TEXT DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS role          TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ─── 3. CHATS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL CHECK (sender IN ('user', 'admin')),
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sender     TEXT,
  ADD COLUMN IF NOT EXISTS message    TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── 4. CAMPAIGN SUBMISSIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaign_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id   UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  email        TEXT NOT NULL,
  name         TEXT NOT NULL,
  ad_type      TEXT NOT NULL,
  product_name TEXT NOT NULL,
  tagline      TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  audience     TEXT NOT NULL,
  platforms    JSONB NOT NULL DEFAULT '[]',
  budget       TEXT NOT NULL,
  timeline     TEXT NOT NULL,
  duration     TEXT NOT NULL,
  website      TEXT,
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.campaign_submissions
  ADD COLUMN IF NOT EXISTS visitor_id   UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email        TEXT,
  ADD COLUMN IF NOT EXISTS name         TEXT,
  ADD COLUMN IF NOT EXISTS ad_type      TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS tagline      TEXT,
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS category     TEXT,
  ADD COLUMN IF NOT EXISTS audience     TEXT,
  ADD COLUMN IF NOT EXISTS platforms    JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS budget       TEXT,
  ADD COLUMN IF NOT EXISTS timeline     TEXT,
  ADD COLUMN IF NOT EXISTS duration     TEXT,
  ADD COLUMN IF NOT EXISTS website      TEXT,
  ADD COLUMN IF NOT EXISTS notes        TEXT,
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_notes  TEXT,
  ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── 5. SUBSCRIBERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id    UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  email         TEXT UNIQUE NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS visitor_id    UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email         TEXT,
  ADD COLUMN IF NOT EXISTS active        BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── 6. HYDROPULSE ORDERS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hydropulse_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id       UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT,
  shipping_address TEXT NOT NULL,
  zip_code         TEXT,
  payment_method   TEXT NOT NULL,
  items            JSONB NOT NULL DEFAULT '[]',
  total_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending_payment',
  placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hydropulse_orders
  ADD COLUMN IF NOT EXISTS visitor_id       UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_name    TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone   TEXT,
  ADD COLUMN IF NOT EXISTS customer_email   TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS zip_code         TEXT,
  ADD COLUMN IF NOT EXISTS payment_method   TEXT,
  ADD COLUMN IF NOT EXISTS items            JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS total_amount     NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'pending_payment',
  ADD COLUMN IF NOT EXISTS placed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── 7. HYDROPULSE REVIEWS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hydropulse_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  location      TEXT DEFAULT 'India',
  comment       TEXT NOT NULL,
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'approved',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    TEXT
);

-- KEY FIX: Add 'status' column if table pre-existed without it
ALTER TABLE public.hydropulse_reviews
  ADD COLUMN IF NOT EXISTS reviewer_name TEXT,
  ADD COLUMN IF NOT EXISTS rating        INTEGER,
  ADD COLUMN IF NOT EXISTS location      TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS comment       TEXT,
  ADD COLUMN IF NOT EXISTS verified      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS ip_address    TEXT;

-- ─── 8. INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_visitors_email     ON public.visitors(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email     ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_chats_visitor_id   ON public.chats(visitor_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email  ON public.campaign_submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.campaign_submissions(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email  ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_hp_orders_visitor  ON public.hydropulse_orders(visitor_id);
CREATE INDEX IF NOT EXISTS idx_hp_reviews_status  ON public.hydropulse_reviews(status);

-- ─── 9. ENABLE RLS ────────────────────────────────────────────
ALTER TABLE public.visitors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydropulse_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydropulse_reviews   ENABLE ROW LEVEL SECURITY;

-- ─── 10. RLS POLICIES ─────────────────────────────────────────
-- Drop all first, then recreate (PostgreSQL has no CREATE POLICY IF NOT EXISTS)

-- visitors
DROP POLICY IF EXISTS "visitors_service_all" ON public.visitors;
DROP POLICY IF EXISTS "visitors_anon_select" ON public.visitors;
CREATE POLICY "visitors_service_all" ON public.visitors FOR ALL     TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "visitors_anon_select" ON public.visitors FOR SELECT  TO anon         USING (TRUE);

-- profiles
DROP POLICY IF EXISTS "profiles_service_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_anon_select" ON public.profiles;
CREATE POLICY "profiles_service_all" ON public.profiles FOR ALL     TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "profiles_anon_select" ON public.profiles FOR SELECT  TO anon         USING (TRUE);

-- chats
DROP POLICY IF EXISTS "chats_service_all" ON public.chats;
DROP POLICY IF EXISTS "chats_anon_select" ON public.chats;
CREATE POLICY "chats_service_all" ON public.chats FOR ALL     TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "chats_anon_select" ON public.chats FOR SELECT  TO anon         USING (TRUE);

-- campaign_submissions
DROP POLICY IF EXISTS "submissions_service_all" ON public.campaign_submissions;
DROP POLICY IF EXISTS "submissions_anon_select" ON public.campaign_submissions;
CREATE POLICY "submissions_service_all" ON public.campaign_submissions FOR ALL     TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "submissions_anon_select" ON public.campaign_submissions FOR SELECT  TO anon         USING (TRUE);

-- subscribers
DROP POLICY IF EXISTS "subscribers_service_all" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_anon_select" ON public.subscribers;
CREATE POLICY "subscribers_service_all" ON public.subscribers FOR ALL     TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "subscribers_anon_select" ON public.subscribers FOR SELECT  TO anon         USING (TRUE);

-- hydropulse_orders (private — no anon access)
DROP POLICY IF EXISTS "hp_orders_service_all" ON public.hydropulse_orders;
CREATE POLICY "hp_orders_service_all" ON public.hydropulse_orders FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- hydropulse_reviews
DROP POLICY IF EXISTS "hp_reviews_service_all" ON public.hydropulse_reviews;
DROP POLICY IF EXISTS "hp_reviews_anon_select" ON public.hydropulse_reviews;
CREATE POLICY "hp_reviews_service_all" ON public.hydropulse_reviews FOR ALL    TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "hp_reviews_anon_select" ON public.hydropulse_reviews FOR SELECT TO anon         USING (status = 'approved');

-- ─── DONE ────────────────────────────────────────────────────
SELECT 'Schema setup complete' AS status;
