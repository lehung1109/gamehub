-- supabase/migrations/20260913100000_community_shared_configs.sql
-- Migration: Community Shared Configs for Community Marketplace Hub

-- Table: public.community_shared_configs
CREATE TABLE IF NOT EXISTS public.community_shared_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.game_configs(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Giáo viên GameHub',
  title TEXT NOT NULL,
  description TEXT,
  game_id TEXT NOT NULL,
  cefr_level TEXT NOT NULL DEFAULT 'A1',
  topic TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  likes_count INT NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  clone_count INT NOT NULL DEFAULT 0 CHECK (clone_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for search, filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_community_configs_game_id ON public.community_shared_configs (game_id);
CREATE INDEX IF NOT EXISTS idx_community_configs_cefr_level ON public.community_shared_configs (cefr_level);
CREATE INDEX IF NOT EXISTS idx_community_configs_created_at ON public.community_shared_configs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_configs_likes ON public.community_shared_configs (likes_count DESC);

-- Enable Row Level Security
ALTER TABLE public.community_shared_configs ENABLE ROW LEVEL SECURITY;

-- 1. Read: Allow anyone to view community shared configs
CREATE POLICY "Allow read access to community shared configs"
  ON public.community_shared_configs
  FOR SELECT
  USING (true);

-- 2. Insert: Allow authenticated teachers to publish configs
CREATE POLICY "Allow authenticated teachers to insert community shared configs"
  ON public.community_shared_configs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

-- 3. Update: Allow authors to update their community shared configs
CREATE POLICY "Allow authors to update their community shared configs"
  ON public.community_shared_configs
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

-- 4. Delete: Allow authors to delete their community shared configs
CREATE POLICY "Allow authors to delete their community shared configs"
  ON public.community_shared_configs
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = author_id);

-- Trigger: Automatic updated_at timestamp
DROP TRIGGER IF EXISTS trg_community_shared_configs_updated_at ON public.community_shared_configs;
CREATE TRIGGER trg_community_shared_configs_updated_at
  BEFORE UPDATE ON public.community_shared_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
