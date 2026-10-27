-- ==============================================================================
-- Zee Writes - Supabase Database Schema
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

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles (status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles (published_at DESC);

-- 2. Create site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    raw_payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies: Allow public reads
CREATE POLICY "Allow public read access to articles"
ON public.articles FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to site_settings"
ON public.site_settings FOR SELECT
USING (true);

-- 5. Policies: Allow full management using the service_role key or public (if no custom auth)
CREATE POLICY "Allow service role full access to articles"
ON public.articles FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to site_settings"
ON public.site_settings FOR ALL
USING (true)
WITH CHECK (true);
