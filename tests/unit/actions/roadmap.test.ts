import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStudentRoadmapProgressAction,
  recordRoadmapNodeCompletionAction,
  syncLocalRoadmapProgressAction,
  getClassRoadmapOverviewAction,
} from '@/app/actions/roadmap';
import * as adminSupabase from '@/lib/supabase/admin';
import * as serverSupabase from '@/lib/supabase/server';
import type { StudentNodeProgress } from '@/types/roadmap';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Roadmap Server Actions', () => {
  let mockAdminClient: {
    from: ReturnType<typeof vi.fn>;
  };
  let mockServerClient: {
    auth: {
      getUser: ReturnType<typeof vi.fn>;
    };
    from: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAdminClient = {
      from: vi.fn(),
    };

    mockServerClient = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockAdminClient as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    );
    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockServerClient as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    );
  });

  describe('Input Validation', () => {
    it('rejects invalid student name or class code', async () => {
      const res1 = await getStudentRoadmapProgressAction('', '');
      expect(res1.success).toBe(false);
      expect(res1.error).toBeDefined();

      const res2 = await getStudentRoadmapProgressAction('DEMO12', '   ');
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/tên học sinh/i);

      const res3 = await getStudentRoadmapProgressAction('   ', 'Alice');
      expect(res3.success).toBe(false);
      expect(res3.error).toMatch(/mã lớp/i);
    });

    it('rejects record completion with negative or invalid scores', async () => {
      const resNegative = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: -5,
        totalQuestions: 10,
      });
      expect(resNegative.success).toBe(false);
      expect(resNegative.error).toBeDefined();

      const resZeroTotal = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 5,
        totalQuestions: 0,
      });
      expect(resZeroTotal.success).toBe(false);

      const resEmptyNode = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: '',
        worldId: 'world-1',
        score: 5,
        totalQuestions: 10,
      });
      expect(resEmptyNode.success).toBe(false);

      const resScoreTooHigh = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 11,
        totalQuestions: 10,
      });
      expect(resScoreTooHigh.success).toBe(false);
      expect(resScoreTooHigh.error).toMatch(/vượt quá/i);
    });

    it('rejects syncLocalRoadmapProgress with invalid inputs', async () => {
      const res = await syncLocalRoadmapProgressAction('', 'Alice', {});
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/mã lớp/i);
    });

    it('rejects getClassRoadmapOverview with empty classroomId', async () => {
      const res = await getClassRoadmapOverviewAction('');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('getStudentRoadmapProgressAction', () => {
    it('returns error when classroom is inactive or does not exist', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      mockAdminClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: eqMock }),
      });

      const res = await getStudentRoadmapProgressAction('UNKNOWN', 'Alice');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/mã lớp không hợp lệ hoặc lớp học không hoạt động/i);
    });

    it('returns empty roadmap state when student does not exist yet', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const classEqMock = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
      });

      const studentLimitMock = vi.fn().mockResolvedValue({ data: [], error: null });
      const studentEqNameMock = vi.fn().mockReturnValue({ limit: studentLimitMock });
      const studentEqClassMock = vi.fn().mockReturnValue({ eq: studentEqNameMock });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return { select: vi.fn().mockReturnValue({ eq: classEqMock }) };
        }
        if (table === 'students') {
          return { select: vi.fn().mockReturnValue({ eq: studentEqClassMock }) };
        }
        return {};
      });

      const res = await getStudentRoadmapProgressAction('DEMO12', 'NewStudent');
      expect(res.success).toBe(true);
      expect(res.data).toEqual({
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      });
    });

    it('returns aggregated roadmap state for existing student', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const studentMock = { id: 's-1', name: 'Alice' };

      const mockProgressRows = [
        {
          id: 'p-1',
          student_id: 's-1',
          world_id: 'world-1',
          node_id: 'w1-n1',
          stars: 3,
          high_score: 100,
          attempts: 2,
          is_completed: true,
          completed_at: '2026-09-12T10:00:00Z',
        },
        {
          id: 'p-2',
          student_id: 's-1',
          world_id: 'world-1',
          node_id: 'w1-n2',
          stars: 2,
          high_score: 80,
          attempts: 1,
          is_completed: true,
          completed_at: '2026-09-12T11:00:00Z',
        },
      ];

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [studentMock], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockProgressRows, error: null }),
            }),
          };
        }
        return {};
      });

      const res = await getStudentRoadmapProgressAction('DEMO12', 'Alice');
      expect(res.success).toBe(true);
      expect(res.data?.totalStars).toBe(5);
      expect(res.data?.completedNodeIds).toEqual(['w1-n1', 'w1-n2']);
      expect(res.data?.nodesProgress['w1-n1']).toEqual({
        nodeId: 'w1-n1',
        worldId: 'world-1',
        stars: 3,
        highScore: 100,
        attempts: 2,
        isCompleted: true,
        completedAt: '2026-09-12T10:00:00Z',
      });
    });
  });

  describe('recordRoadmapNodeCompletionAction', () => {
    it('records first attempt completion, saves progress, and awards bonus stars if 3 stars', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const studentMock = { id: 's-1', name: 'Alice' };

      const existingGamificationRow = {
        id: 'gam-1',
        student_id: 's-1',
        inventory: {
          ownedItemIds: [],
          bonusStars: 10,
        },
      };

      const upsertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              student_id: 's-1',
              node_id: 'w1-n1',
              world_id: 'world-1',
              stars: 3,
              high_score: 100,
              attempts: 1,
              is_completed: true,
            },
            error: null,
          }),
        }),
      });

      const gamUpdateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [studentMock], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
            upsert: upsertMock,
          };
        }
        if (table === 'student_gamification') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: existingGamificationRow, error: null }),
              }),
            }),
            update: gamUpdateMock,
          };
        }
        return {};
      });

      const res = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 10,
        totalQuestions: 10,
      });

      expect(res.success).toBe(true);
      expect(res.stars).toBe(3);
      expect(res.updatedNode?.stars).toBe(3);
      expect(res.updatedNode?.highScore).toBe(100);
      expect(res.updatedNode?.attempts).toBe(1);
      expect(res.updatedNode?.isCompleted).toBe(true);

      // Verify upsert was called
      expect(upsertMock).toHaveBeenCalled();
      // Verify gamification bonusStars was incremented (10 + 5 = 15)
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            bonusStars: 15,
          }),
        })
      );
    });

    it('merges non-regressively when replaying node with lower score without awarding bonus stars', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const studentMock = { id: 's-1', name: 'Alice' };

      const existingRecord = {
        student_id: 's-1',
        node_id: 'w1-n1',
        world_id: 'world-1',
        stars: 3,
        high_score: 100,
        attempts: 2,
        is_completed: true,
        completed_at: '2026-09-12T10:00:00Z',
      };

      const upsertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...existingRecord, attempts: 3 },
            error: null,
          }),
        }),
      });

      const gamUpdateMock = vi.fn();

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [studentMock], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: existingRecord, error: null }),
                }),
              }),
            }),
            upsert: upsertMock,
          };
        }
        if (table === 'student_gamification') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            update: gamUpdateMock,
          };
        }
        return {};
      });

      // Score 6/10 = 60% = 1 star
      const res = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 6,
        totalQuestions: 10,
      });

      expect(res.success).toBe(true);
      expect(res.stars).toBe(1); // 1 star for this attempt
      expect(res.updatedNode?.stars).toBe(3); // Non-regressed stars remain 3
      expect(res.updatedNode?.highScore).toBe(100); // High score preserved
      expect(res.updatedNode?.attempts).toBe(3); // Attempts incremented

      // Bonus stars not updated since this attempt was 1 star
      expect(gamUpdateMock).not.toHaveBeenCalled();
    });

    it('does not award duplicate bonus stars when replaying a node that already had 3 stars', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const studentMock = { id: 's-1', name: 'Alice' };

      const existingRecord = {
        student_id: 's-1',
        node_id: 'w1-n1',
        world_id: 'world-1',
        stars: 3,
        high_score: 100,
        attempts: 1,
        is_completed: true,
        completed_at: '2026-09-12T10:00:00Z',
      };

      const upsertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...existingRecord, attempts: 2 },
            error: null,
          }),
        }),
      });

      const gamUpdateMock = vi.fn();

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [studentMock], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: existingRecord, error: null }),
                }),
              }),
            }),
            upsert: upsertMock,
          };
        }
        if (table === 'student_gamification') {
          return {
            select: vi.fn(),
            update: gamUpdateMock,
          };
        }
        return {};
      });

      // Student scores 10/10 (3 stars) AGAIN on an already 3-star node
      const res = await recordRoadmapNodeCompletionAction('DEMO12', 'Alice', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 10,
        totalQuestions: 10,
      });

      expect(res.success).toBe(true);
      expect(res.stars).toBe(3);
      // Gamification update MUST NOT be called (prevent infinite star exploit)
      expect(gamUpdateMock).not.toHaveBeenCalled();
    });

    it('creates student record automatically if student does not exist yet', async () => {
      const classMock = { id: 'c-1', is_active: true };

      const studentInsertSingleMock = vi.fn().mockResolvedValue({
        data: { id: 's-new', name: 'NewPlayer' },
        error: null,
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: studentInsertSingleMock,
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
            upsert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    student_id: 's-new',
                    node_id: 'w1-n1',
                    world_id: 'world-1',
                    stars: 2,
                    high_score: 80,
                    attempts: 1,
                    is_completed: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const res = await recordRoadmapNodeCompletionAction('DEMO12', 'NewPlayer', {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 8,
        totalQuestions: 10,
      });

      expect(res.success).toBe(true);
      expect(res.stars).toBe(2);
      expect(res.updatedNode?.stars).toBe(2);
    });
  });

  describe('syncLocalRoadmapProgressAction', () => {
    it('syncs local offline entries into cloud and returns synced count', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const studentMock = { id: 's-1', name: 'Alice' };

      const localProgress: Record<string, StudentNodeProgress> = {
        'w1-n1': {
          nodeId: 'w1-n1',
          worldId: 'world-1',
          stars: 3,
          highScore: 100,
          attempts: 2,
          isCompleted: true,
        },
        'w1-n2': {
          nodeId: 'w1-n2',
          worldId: 'world-1',
          stars: 2,
          highScore: 80,
          attempts: 1,
          isCompleted: true,
        },
      };

      const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [studentMock], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [
                    {
                      student_id: 's-1',
                      node_id: 'w1-n1',
                      world_id: 'world-1',
                      stars: 1,
                      high_score: 60,
                      attempts: 1,
                      is_completed: true,
                    },
                  ],
                  error: null,
                }),
              }),
            }),
            upsert: upsertMock,
          };
        }
        return {};
      });

      const res = await syncLocalRoadmapProgressAction('DEMO12', 'Alice', localProgress);
      expect(res.success).toBe(true);
      expect(res.syncedCount).toBe(2);
      expect(upsertMock).toHaveBeenCalled();
    });

    it('deduplicates entries by nodeId and clamps stars to maximum 3', async () => {
      const classMock = { id: 'c-1', is_active: true };
      const studentMock = { id: 's-1', name: 'Alice' };

      const localProgress: Record<string, StudentNodeProgress> = {
        'entry-1': {
          nodeId: 'w1-n1',
          worldId: 'world-1',
          stars: 2,
          highScore: 80,
          attempts: 1,
          isCompleted: true,
        },
        'entry-2': {
          nodeId: 'w1-n1', // duplicate nodeId!
          worldId: 'world-1',
          stars: 5, // invalid > 3 stars!
          highScore: 100,
          attempts: 2,
          isCompleted: true,
        },
      };

      let capturedUpsertRows: Array<Record<string, unknown>> = [];
      const upsertMock = vi.fn().mockImplementation((rows: Array<Record<string, unknown>>) => {
        capturedUpsertRows = rows;
        return Promise.resolve({ data: null, error: null });
      });

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: classMock, error: null }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [studentMock], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
            upsert: upsertMock,
          };
        }
        return {};
      });

      const res = await syncLocalRoadmapProgressAction('DEMO12', 'Alice', localProgress);
      expect(res.success).toBe(true);
      expect(res.syncedCount).toBe(1); // Deduplicated to 1 row
      expect(capturedUpsertRows).toHaveLength(1);
      expect(capturedUpsertRows[0].stars).toBe(3); // Clamped to 3!
    });
  });

  describe('getClassRoadmapOverviewAction', () => {
    it('rejects unauthenticated user', async () => {
      mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      const res = await getClassRoadmapOverviewAction('class-123');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/đăng nhập/i);
    });

    it('rejects teacher who does not own the classroom', async () => {
      mockServerClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'teacher-1', email: 'teacher@test.com' } },
        error: null,
      });

      mockServerClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      });

      const res = await getClassRoadmapOverviewAction('class-123');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/quyền truy cập/i);
    });

    it('aggregates class world progress, completion rates, and bottlenecks for owned classroom', async () => {
      mockServerClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'teacher-1', email: 'teacher@test.com' } },
        error: null,
      });

      const classroomMock = { id: 'class-123', teacher_id: 'teacher-1' };
      const studentsMock = [
        { id: 's-1', name: 'Alice' },
        { id: 's-2', name: 'Bob' },
      ];

      const progressRowsMock = [
        {
          student_id: 's-1',
          world_id: 'world-1',
          node_id: 'w1-n1',
          stars: 3,
          high_score: 100,
          attempts: 1,
          is_completed: true,
        },
        {
          student_id: 's-2',
          world_id: 'world-1',
          node_id: 'w1-n1',
          stars: 2,
          high_score: 80,
          attempts: 2,
          is_completed: true,
        },
        {
          student_id: 's-1',
          world_id: 'world-1',
          node_id: 'w1-n2',
          stars: 0,
          high_score: 40,
          attempts: 3,
          is_completed: false,
        },
      ];

      mockServerClient.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: classroomMock, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: studentsMock, error: null }),
            }),
          };
        }
        if (table === 'student_roadmap_progress') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: progressRowsMock, error: null }),
            }),
          };
        }
        return {};
      });

      const res = await getClassRoadmapOverviewAction('class-123');
      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.totalStudents).toBe(2);
      expect(res.data?.worldProgress.length).toBeGreaterThan(0);
      const world1 = res.data?.worldProgress.find((w) => w.worldId === 'world-1');
      expect(world1).toBeDefined();
      expect(world1?.averageStars).toBeGreaterThan(0);
      // Bottleneck node should identify w1-n2 which has failed attempts
      expect(res.data?.bottleneckNodes.some((b) => b.nodeId === 'w1-n2')).toBe(true);
    });
  });
});
