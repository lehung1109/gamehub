// src/types/push.ts

export type PushTopic =
  | 'daily_streak'
  | 'srs_review'
  | 'teacher_announcement'
  | 'pvp_challenge';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface PushPreferences {
  daily_streak: boolean;
  srs_review: boolean;
  teacher_announcement: boolean;
  preferred_hour?: number; // 0-23, default 19 (7 PM)
}

export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushMessagePayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    topic?: PushTopic;
    timestamp?: number;
    [key: string]: unknown;
  };
  actions?: PushNotificationAction[];
}

export interface PushSendResult {
  success: boolean;
  endpoint: string;
  statusCode?: number;
  error?: string;
  isExpired?: boolean;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id?: string | null;
  student_id?: string | null;
  parent_token?: string | null;
  preferences: PushPreferences;
  created_at: string;
  updated_at?: string;
  last_notified_at?: string | null;
}

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  daily_streak: true,
  srs_review: true,
  teacher_announcement: true,
  preferred_hour: 19,
};
