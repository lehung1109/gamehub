# Phase 12 Implementation Plan: Web Push Notifications & Spaced Repetition Reminders

## Work Breakdown Structure

- **Task 1: TypeScript Contracts & Domain Models**
  - Files: `src/types/push.ts`, `src/types/index.ts`, `tests/unit/types/push-types.test.ts`
  - Contracts for `PushSubscriptionData`, `PushPreferences`, `PushMessagePayload`, `PushTopic`, `PushSendResult`.

- **Task 2: Database Migration & Schema Integration**
  - Files: `supabase/migrations/20260913140000_push_notifications.sql`, `scripts/append-database-types.mjs`, `src/types/database.ts`, `tests/unit/migrations/push-schema.test.ts`
  - `push_subscriptions` table, indexes, RLS, types append script.

- **Task 3: Pure Push Reminder Generator & Service Worker Push Engine**
  - Files: `src/lib/push/reminder-generator.ts`, `src/lib/push/push-service.ts`, `public/sw.js`, `tests/unit/lib/push-reminder-generator.test.ts`, `tests/unit/lib/push-service.test.ts`, `tests/unit/pwa/sw-push-events.test.ts`
  - VAPID signing, payload formatting, push and notificationclick event handlers.

- **Task 4: Server Actions for Subscription Management & Class Push Broadcast**
  - Files: `src/app/actions/push.ts`, `tests/unit/actions/push-actions.test.ts`
  - `savePushSubscriptionAction`, `removePushSubscriptionAction`, `sendClassAnnouncementPushAction`, `sendTestPushAction`.

- **Task 5: Client Hook & Kid-Friendly Notification UI Components**
  - Files: `src/hooks/usePushNotification.ts`, `src/components/push/PushNotificationPrompt.tsx`, `src/components/push/PushPreferencesCard.tsx`, `tests/unit/components/PushNotificationPrompt.test.tsx`
  - Permission requests, topic preference checkboxes, $\ge 16$px typography enforcement.

- **Task 6: Shell & Parent/Teacher Integration**
  - Files: `src/app/layout.tsx`, `src/components/parent/ParentDashboardView.tsx`, `src/components/admin/ParentAccessManager.tsx`, `tests/unit/components/PushIntegration.test.tsx`
  - Embed push prompt in app layout and parent dashboard.

- **Task 7: Playwright End-to-End Verification**
  - Files: `tests/e2e/web-push-notifications.spec.ts`
  - Verify permission prompt modal, preference toggles, test notification action, and responsive scaling.
