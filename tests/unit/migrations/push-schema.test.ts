import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type {
  PushSubscriptionRow,
  PushSubscriptionInsert,
  PushSubscriptionUpdate,
} from '@/types/database';

describe('Push Notifications Migration & Schema', () => {
  it('contains the push_subscriptions SQL migration file', () => {
    const migrationPath = path.resolve('supabase/migrations/20260913140000_push_notifications.sql');
    expect(fs.existsSync(migrationPath)).toBe(true);

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    expect(sqlContent).toContain('create table if not exists public.push_subscriptions');
    expect(sqlContent).toContain('endpoint text not null unique');
    expect(sqlContent).toContain('p256dh text not null');
    expect(sqlContent).toContain('auth text not null');
    expect(sqlContent).toContain('preferences jsonb');
    expect(sqlContent).toContain('idx_push_subscriptions_endpoint');
    expect(sqlContent).toContain('alter table public.push_subscriptions enable row level security');
  });

  it('validates TypeScript database Row, Insert, and Update helper types', () => {
    const row: PushSubscriptionRow = {
      id: 'sub-1',
      endpoint: 'https://push.example.com/device-1',
      p256dh: 'key1',
      auth: 'auth1',
      user_id: null,
      student_id: 'student-99',
      parent_token: null,
      preferences: { daily_streak: true, srs_review: true, teacher_announcement: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_notified_at: null,
    };

    expect(row.endpoint).toBe('https://push.example.com/device-1');

    const insert: PushSubscriptionInsert = {
      endpoint: 'https://push.example.com/device-2',
      p256dh: 'key2',
      auth: 'auth2',
      student_id: 'student-100',
    };

    expect(insert.endpoint).toBe('https://push.example.com/device-2');

    const update: PushSubscriptionUpdate = {
      last_notified_at: new Date().toISOString(),
    };

    expect(update.last_notified_at).toBeDefined();
  });
});
