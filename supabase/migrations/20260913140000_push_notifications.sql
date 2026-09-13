-- Migration: 20260913140000_push_notifications.sql
-- Description: Web Push Notifications subscriptions, preferences, and delivery logs

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id uuid references auth.users(id) on delete cascade,
  student_id text references public.students(id) on delete cascade,
  parent_token text,
  preferences jsonb not null default '{"daily_streak": true, "srs_review": true, "teacher_announcement": true, "preferred_hour": 19}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_notified_at timestamptz
);

-- Indexes for rapid lookup by device endpoint or target receiver
create index if not exists idx_push_subscriptions_endpoint on public.push_subscriptions (endpoint);
create index if not exists idx_push_subscriptions_student_id on public.push_subscriptions (student_id);
create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions (user_id);
create index if not exists idx_push_subscriptions_parent_token on public.push_subscriptions (parent_token);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Public can upsert their device subscription
create policy "Allow all users to insert or update push subscriptions"
  on public.push_subscriptions
  for all
  using (true)
  with check (true);
