-- Migration: Add srs_deck column to student_gamification for Leitner Spaced Repetition System
ALTER TABLE public.student_gamification 
ADD COLUMN IF NOT EXISTS srs_deck JSONB NOT NULL DEFAULT '[]'::jsonb;
