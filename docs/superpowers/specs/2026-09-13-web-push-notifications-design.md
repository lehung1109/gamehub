# Phase 12 Technical Design: Web Push Notifications & Spaced Repetition (SRS) Reminders

## 1. Overview & Context

Following the implementation of the Progressive Web App (PWA) and Offline Audio Cache in Phase 11, GameHub is fully installable on mobile and desktop devices. However, learning momentum often drops when students or parents forget to open the app.
Phase 12 introduces **Web Push Notifications** compliant with RFC 8291 / 8292 (VAPID) to actively support students' learning habits:
1. **Daily Streak Preservation**: Timely notifications (e.g. at 19:00) before midnight to prevent losing hard-earned streaks.
2. **Spaced Repetition (SRS) Review Alerts**: Alerts when mistake notebook flashcards are due for memory reinforcement.
3. **Teacher Announcement Broadcasts**: Instant push delivered to parents' mobile devices when teachers post notices or homework notes.
4. **Interactive Action Buttons**: Directly launch mini-games (`/games/flashcard`, `/roadmap`) or view announcements from system notifications.

---

## 2. Architecture & Data Flow

```
[Browser / PWA Client]
   │
   ├─► navigator.serviceWorker.ready -> pushManager.subscribe({ userVisibleOnly, applicationServerKey })
   │
   ├─► Server Action: savePushSubscriptionAction(subscription, preferences, studentId/parentToken)
   │      │
   │      ▼
   │   [Database: push_subscriptions]
   │
[Server / Scheduled Worker / Teacher Action]
   │
   ├─► Reminder Generator: generateStreakReminder() / generateSrsReviewReminder()
   │
   ├─► web-push: sendNotification(sub, payload, { vapidDetails })
   │      │
   │      ▼
   │   [Push Service: FCM / APNs / Mozilla Autopush]
   │      │
   │      ▼
[Device Operating System]
   │
   ├─► Service Worker ('push' event in public/sw.js)
   │      │
   │      ▼
   │   self.registration.showNotification(title, { icon, badge, body, actions, data })
   │
   └─► User Clicks Notification ('notificationclick' in public/sw.js)
          │
          ▼
       clients.openWindow(url) -> Navigates to target GameHub screen
```

---

## 3. Database Schema (`push_subscriptions`)

```sql
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id uuid references auth.users(id) on delete cascade,
  student_id text references public.students(id) on delete cascade,
  parent_token text,
  preferences jsonb not null default '{"daily_streak": true, "srs_review": true, "teacher_announcement": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_notified_at timestamptz
);
```

---

## 4. Typography & Child Safety Constraints

1. **Kid-Friendly Typography**: Minimum font size $\ge 16$px across all dialogs, prompt banners, and toggle switches. Strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
2. **Kid & Parent Privacy**:
   - Push subscriptions are permission-based with an explicit opt-in banner.
   - Users can unsubscribe at any time with a single click.
   - Device endpoints are stored securely without collecting personal device telemetry.
