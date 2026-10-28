-- ==============================================================================
-- PROMPTRUSH SCHEMA MIGRATION 001
-- Target: Supabase PostgreSQL
-- Hiring Challenge: NxtWave Growth Intern – AI, Experiments & Community
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    normalized_email TEXT NOT NULL UNIQUE,
    college TEXT NOT NULL,
    branch TEXT NOT NULL,
    graduation_year INTEGER NOT NULL DEFAULT 2027,
    consent BOOLEAN NOT NULL DEFAULT FALSE,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by TEXT,
    acquisition_source TEXT,
    experiment_variant TEXT CHECK (experiment_variant IN ('A', 'B')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(normalized_email);
CREATE INDEX IF NOT EXISTS idx_registrations_referral_code ON public.registrations(referral_code);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_registrations_source ON public.registrations(acquisition_source);

-- 3. CHALLENGE ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anonymous_session_id TEXT NOT NULL,
    multiple_choice_answer TEXT CHECK (multiple_choice_answer IN ('A', 'B', NULL)),
    written_prompt TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_attempts_session ON public.challenge_attempts(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_completed ON public.challenge_attempts(completed);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON public.challenge_attempts(started_at);

-- 4. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anonymous_session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    acquisition_source TEXT,
    referral_code TEXT,
    experiment_variant TEXT CHECK (experiment_variant IN ('A', 'B')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_session ON public.analytics_events(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.analytics_events(created_at);

-- 5. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    referred_registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_registration_id);

-- 6. CAMPAIGN LINKS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_name TEXT NOT NULL,
    campaign_code TEXT NOT NULL UNIQUE,
    generated_url TEXT NOT NULL,
    utm_source TEXT NOT NULL,
    utm_medium TEXT NOT NULL,
    utm_campaign TEXT NOT NULL,
    utm_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_code ON public.campaign_links(campaign_code);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_links ENABLE ROW LEVEL SECURITY;

-- Registrations: Public can insert their registration; only authenticated admins/service role can select all
CREATE POLICY "Public registrations insert" ON public.registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin view registrations" ON public.registrations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Challenge Attempts: Public can insert attempt and read their own attempt by id
CREATE POLICY "Public insert attempt" ON public.challenge_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read attempt by id" ON public.challenge_attempts
    FOR SELECT USING (true);

CREATE POLICY "Public update attempt" ON public.challenge_attempts
    FOR UPDATE USING (true);

-- Analytics Events: Public insert
CREATE POLICY "Public log analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin view analytics" ON public.analytics_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Campaign Links: Public read, Admin write
CREATE POLICY "Public view campaigns" ON public.campaign_links
    FOR SELECT USING (true);

CREATE POLICY "Admin manage campaigns" ON public.campaign_links
    FOR ALL USING (auth.role() = 'authenticated');

-- Referrals: Admin view
CREATE POLICY "Admin view referrals" ON public.referrals
    FOR SELECT USING (auth.role() = 'authenticated');

