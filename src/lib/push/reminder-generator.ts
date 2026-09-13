// src/lib/push/reminder-generator.ts
import type { PushMessagePayload } from '@/types/push';

export interface StreakReminderOptions {
  studentName?: string;
  currentStreak: number;
  hoursRemaining: number;
}

export function generateStreakReminder({
  studentName,
  currentStreak,
  hoursRemaining,
}: StreakReminderOptions): PushMessagePayload {
  const title = studentName
    ? `🔥 ${studentName} ơi, đừng để tắt ngọn lửa chuỗi ngày!`
    : '🔥 Đừng để tắt ngọn lửa chuỗi ngày!';

  const timeText = hoursRemaining <= 1 ? 'dưới 1 tiếng' : `${hoursRemaining} tiếng`;
  const body = `Bạn chỉ còn ${timeText} để hoàn thành 1 thử thách và duy trì chuỗi ${currentStreak} ngày liên tục!`;

  return {
    title,
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'streak-reminder',
    data: {
      url: '/roadmap',
      topic: 'daily_streak',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open_roadmap', title: 'Khám phá ngay' },
      { action: 'dismiss', title: 'Để sau' },
    ],
  };
}

export interface SrsReviewReminderOptions {
  studentName?: string;
  pendingCardsCount: number;
  words?: string[];
}

export function generateSrsReviewReminder({
  studentName,
  pendingCardsCount,
  words,
}: SrsReviewReminderOptions): PushMessagePayload {
  const title = studentName
    ? `📚 ${studentName} có từ vựng cần ôn tập hôm nay!`
    : '📚 Có từ vựng cần ôn tập hôm nay!';

  let wordListStr = '';
  if (words && words.length > 0) {
    const previewWords = words.slice(0, 3).join(', ');
    wordListStr = ` (${previewWords}${words.length > 3 ? '...' : ''})`;
  }

  const body = `Sổ tay từ khó có ${pendingCardsCount} từ${wordListStr} đang chờ bạn củng cố trí nhớ 5 phút nhé!`;

  return {
    title,
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'srs-review-reminder',
    data: {
      url: '/games/flashcard',
      topic: 'srs_review',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open_flashcards', title: 'Ôn ngay 5p' },
      { action: 'dismiss', title: 'Để sau' },
    ],
  };
}

export interface TeacherAnnouncementReminderOptions {
  classroomName: string;
  title: string;
  excerpt?: string;
  teacherName?: string;
  announcementId?: string;
  studentId?: string;
}

export function generateTeacherAnnouncementReminder({
  classroomName,
  title,
  excerpt,
  teacherName,
  announcementId,
}: TeacherAnnouncementReminderOptions): PushMessagePayload {
  const header = teacherName ? `${teacherName}: ${title}` : title;
  const body = excerpt ? `${header} - ${excerpt}` : header;

  return {
    title: `📢 Thông báo mới từ ${classroomName}`,
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'teacher-announcement',
    data: {
      url: '/parent',
      topic: 'teacher_announcement',
      announcementId,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'view_announcement', title: 'Xem chi tiết' },
      { action: 'dismiss', title: 'Đã hiểu' },
    ],
  };
}

export function generateTestPushMessage(): PushMessagePayload {
  return {
    title: '🎉 GameHub: Thông báo thử nghiệm!',
    body: 'Thông báo đã sẵn sàng! Bạn sẽ nhận được lời nhắc học tập và duy trì chuỗi ngọn lửa hàng ngày.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'test-notification',
    data: {
      url: '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open_home', title: 'Vào GameHub' },
      { action: 'dismiss', title: 'Đóng' },
    ],
  };
}
