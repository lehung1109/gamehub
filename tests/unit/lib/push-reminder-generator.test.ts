import { describe, it, expect } from 'vitest';
import {
  generateStreakReminder,
  generateSrsReviewReminder,
  generateTeacherAnnouncementReminder,
  generateTestPushMessage,
} from '@/lib/push/reminder-generator';

describe('Push Reminder Generator (Pure Functions)', () => {
  describe('generateStreakReminder', () => {
    it('creates streak reminder with flame emoji and urgent countdown', () => {
      const payload = generateStreakReminder({
        studentName: 'Bảo Nam',
        currentStreak: 5,
        hoursRemaining: 4,
      });

      expect(payload.title).toContain('🔥');
      expect(payload.title).toContain('Bảo Nam');
      expect(payload.body).toContain('chuỗi 5 ngày');
      expect(payload.body).toContain('4 tiếng');
      expect(payload.data?.url).toBe('/roadmap');
      expect(payload.data?.topic).toBe('daily_streak');
      expect(payload.tag).toBe('streak-reminder');
      expect(payload.actions).toHaveLength(2);
      expect(payload.actions?.[0].action).toBe('open_roadmap');
    });

    it('handles anonymous student gracefully', () => {
      const payload = generateStreakReminder({
        currentStreak: 1,
        hoursRemaining: 2,
      });

      expect(payload.title).toBe('🔥 Đừng để tắt ngọn lửa chuỗi ngày!');
      expect(payload.body).toContain('chuỗi 1 ngày');
    });
  });

  describe('generateSrsReviewReminder', () => {
    it('creates SRS review reminder with word count and preview', () => {
      const payload = generateSrsReviewReminder({
        studentName: 'Minh Thư',
        pendingCardsCount: 6,
        words: ['butterfly', 'dinosaur', 'elephant'],
      });

      expect(payload.title).toContain('📚');
      expect(payload.title).toContain('Minh Thư');
      expect(payload.body).toContain('6 từ');
      expect(payload.body).toContain('butterfly, dinosaur, elephant');
      expect(payload.data?.url).toBe('/games/flashcard');
      expect(payload.data?.topic).toBe('srs_review');
      expect(payload.tag).toBe('srs-review-reminder');
      expect(payload.actions?.[0].action).toBe('open_flashcards');
    });

    it('handles single word pending review', () => {
      const payload = generateSrsReviewReminder({
        pendingCardsCount: 1,
      });

      expect(payload.body).toContain('1 từ');
      expect(payload.data?.url).toBe('/games/flashcard');
    });
  });

  describe('generateTeacherAnnouncementReminder', () => {
    it('creates announcement notification for parents and students', () => {
      const payload = generateTeacherAnnouncementReminder({
        classroomName: 'Lớp 2A3',
        teacherName: 'Cô Lan',
        title: 'Ôn tập chuẩn bị kiểm tra giữa kỳ',
        excerpt: 'Các con hãy hoàn thành Thế giới 1 trên bản đồ học tập nhé.',
      });

      expect(payload.title).toContain('📢');
      expect(payload.title).toContain('Lớp 2A3');
      expect(payload.body).toContain('Cô Lan: Ôn tập chuẩn bị kiểm tra giữa kỳ');
      expect(payload.body).toContain('Các con hãy hoàn thành');
      expect(payload.data?.topic).toBe('teacher_announcement');
      expect(payload.tag).toBe('teacher-announcement');
    });
  });

  describe('generateTestPushMessage', () => {
    it('generates friendly test message for subscription verification', () => {
      const payload = generateTestPushMessage();
      expect(payload.title).toContain('🎉');
      expect(payload.title).toContain('GameHub');
      expect(payload.body).toContain('Thông báo đã sẵn sàng');
      expect(payload.icon).toBe('/icons/icon-192.png');
    });
  });
});
