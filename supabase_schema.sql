-- ==============================================================================
-- Zee Writes - Supabase Database Schema & Row Level Security (RLS) Policies
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    excerpt TEXT DEFAULT '',
    category TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tested_on TEXT DEFAULT '',
    reading_time_minutes INTEGER DEFAULT 5,
    word_count INTEGER DEFAULT 500,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published',
    primary_keyword TEXT DEFAULT '',
    meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    raw_payload JSONB NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles (published_at DESC);

-- 2. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    raw_payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Drop any legacy / overly-permissive policies first
DROP POLICY IF EXISTS "Allow public read access to articles" ON public.articles;
DROP POLICY IF EXISTS "Allow public read access to published articles" ON public.articles;
DROP POLICY IF EXISTS "Allow service role full access to articles" ON public.articles;
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow service role full access to site_settings" ON public.site_settings;

-- 5. Public SELECT Policy: Only published articles are visible to anon / public
CREATE POLICY "Allow public read access to published articles"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- 6. Public SELECT Policy for site_settings
CREATE POLICY "Allow public read access to site_settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- 7. Service Role Full Access Policy (INSERT / UPDATE / DELETE / SELECT on all rows including drafts)
-- Only server routes using SUPABASE_SERVICE_ROLE_KEY can create, update, or delete rows.
CREATE POLICY "Allow service role full access to articles"
ON public.articles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to site_settings"
ON public.site_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
