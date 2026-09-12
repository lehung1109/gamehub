'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { calculateNodeStars, mergeNodeProgress } from '@/lib/roadmap';
import worldsData from '@/data/curriculum/worlds.json';
import type {
  RoadmapWorld,
  RoadmapProgressState,
  StudentNodeProgress,
  ClassRoadmapOverview,
  WorldProgressOverview,
  BottleneckNodeOverview,
  StudentRoadmapSummary,
} from '@/types/roadmap';
import type { Database, Json } from '@/types/database';
import type { StudentInventory } from '@/types/shop';

export type {
  ClassRoadmapOverview,
  WorldProgressOverview,
  BottleneckNodeOverview,
  StudentRoadmapSummary,
};

function parseDbInventory(raw: unknown): StudentInventory {
  if (!raw) {
    return { ownedItemIds: [], spentStars: 0, bonusStars: 0 };
  }
  if (typeof raw === 'string') {
    try {
      return parseDbInventory(JSON.parse(raw));
    } catch {
      return { ownedItemIds: [], spentStars: 0, bonusStars: 0 };
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    return {
      ownedItemIds: Array.isArray(obj.ownedItemIds) ? (obj.ownedItemIds as string[]) : [],
      equippedFrameId: typeof obj.equippedFrameId === 'string' ? obj.equippedFrameId : null,
      equippedTitleId: typeof obj.equippedTitleId === 'string' ? obj.equippedTitleId : null,
      spentStars: typeof obj.spentStars === 'number' ? obj.spentStars : 0,
      bonusStars: typeof obj.bonusStars === 'number' ? obj.bonusStars : 0,
    };
  }
  return { ownedItemIds: [], spentStars: 0, bonusStars: 0 };
}

/**
 * Verification helper: checks classroom active status and finds or creates student.
 */
async function verifyAndGetStudent(
  classCode: unknown,
  studentName: unknown,
  supabase: ReturnType<typeof createAdminClient>,
  createIfNotExists: boolean = false
): Promise<{
  studentId?: string;
  classroomId?: string;
  error?: string;
}> {
  if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
    return { error: 'Mã lớp không được để trống' };
  }
  if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
    return { error: 'Tên học sinh không được để trống' };
  }

  const cleanCode = classCode.trim().toUpperCase();
  const cleanName = studentName.trim();
  if (cleanName.length > 100) {
    return { error: 'Tên học sinh không được vượt quá 100 ký tự' };
  }

  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('id, is_active')
    .eq('code', cleanCode)
    .single();

  if (classError || !classroom || !classroom.is_active) {
    return { error: 'Mã lớp không hợp lệ hoặc lớp học không hoạt động' };
  }

  const { data: existingStudents, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('classroom_id', classroom.id)
    .eq('name', cleanName)
    .limit(1);

  if (studentError) {
    console.error('[roadmap] Error querying student:', studentError);
    return { error: 'Lỗi khi tra cứu thông tin học sinh' };
  }

  let studentId = existingStudents?.[0]?.id;

  if (!studentId && createIfNotExists) {
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        classroom_id: classroom.id,
        name: cleanName,
      })
      .select('id')
      .single();

    if (insertError || !newStudent) {
      // Retry in case student was inserted concurrently
      const { data: retryStudents } = await supabase
        .from('students')
        .select('id')
        .eq('classroom_id', classroom.id)
        .eq('name', cleanName)
        .limit(1);

      if (retryStudents?.[0]?.id) {
        studentId = retryStudents[0].id;
      } else {
        console.error('[roadmap] Error creating student:', insertError);
        return { error: 'Không thể tạo bản ghi học sinh' };
      }
    } else {
      studentId = newStudent.id;
    }
  }

  return { studentId, classroomId: classroom.id };
}

/**
 * 1. Fetch current roadmap progress for a student.
 */
export async function getStudentRoadmapProgressAction(
  classCode: string,
  studentName: string
): Promise<{ success: boolean; data?: RoadmapProgressState; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { studentId, error } = await verifyAndGetStudent(classCode, studentName, supabase, false);
    if (error) {
      return { success: false, error };
    }

    if (!studentId) {
      return {
        success: true,
        data: {
          totalStars: 0,
          completedNodeIds: [],
          nodesProgress: {},
        },
      };
    }

    const { data: rows, error: queryError } = await supabase
      .from('student_roadmap_progress')
      .select('*')
      .eq('student_id', studentId);

    if (queryError) {
      console.error('[getStudentRoadmapProgressAction] Error:', queryError);
      return { success: false, error: 'Lỗi khi tải tiến trình lộ trình' };
    }

    const nodesProgress: Record<string, StudentNodeProgress> = {};
    const completedNodeIds: string[] = [];
    let totalStars = 0;

    for (const row of rows || []) {
      const nodeProgress: StudentNodeProgress = {
        nodeId: row.node_id,
        worldId: row.world_id,
        stars: row.stars,
        highScore: row.high_score,
        attempts: row.attempts,
        isCompleted: row.is_completed,
        completedAt: row.completed_at || undefined,
      };

      nodesProgress[row.node_id] = nodeProgress;
      totalStars += row.stars;
      if (row.is_completed) {
        completedNodeIds.push(row.node_id);
      }
    }

    return {
      success: true,
      data: {
        totalStars,
        completedNodeIds,
        nodesProgress,
      },
    };
  } catch (err) {
    console.error('[getStudentRoadmapProgressAction] Unexpected exception:', err);
    return { success: false, error: 'Đã xảy ra lỗi không xác định' };
  }
}

/**
 * 2. Record node completion, merge progress non-regressively, and award bonus stars if 3 stars earned.
 */
export async function recordRoadmapNodeCompletionAction(
  classCode: string,
  studentName: string,
  payload: {
    nodeId: string;
    worldId: string;
    score: number;
    totalQuestions: number;
  }
): Promise<{
  success: boolean;
  stars?: number;
  updatedNode?: StudentNodeProgress;
  error?: string;
}> {
  try {
    if (!payload || typeof payload !== 'object') {
      return { success: false, error: 'Dữ liệu không hợp lệ' };
    }

    const { nodeId, worldId, score, totalQuestions } = payload;
    if (!nodeId || typeof nodeId !== 'string' || !nodeId.trim()) {
      return { success: false, error: 'Node ID không được để trống' };
    }
    if (!worldId || typeof worldId !== 'string' || !worldId.trim()) {
      return { success: false, error: 'World ID không được để trống' };
    }
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      return { success: false, error: 'Điểm số không hợp lệ' };
    }
    if (typeof totalQuestions !== 'number' || isNaN(totalQuestions) || totalQuestions <= 0) {
      return { success: false, error: 'Số câu hỏi phải lớn hơn 0' };
    }

    const supabase = createAdminClient();
    const { studentId, error } = await verifyAndGetStudent(classCode, studentName, supabase, true);
    if (error || !studentId) {
      return { success: false, error: error || 'Không tìm thấy học sinh' };
    }

    const cleanNodeId = nodeId.trim();
    const cleanWorldId = worldId.trim();

    // 1. Fetch existing node progress
    const { data: existingRow, error: selectError } = await supabase
      .from('student_roadmap_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('node_id', cleanNodeId)
      .maybeSingle();

    if (selectError) {
      console.error('[recordRoadmapNodeCompletionAction] Error querying existing progress:', selectError);
      return { success: false, error: 'Lỗi khi kiểm tra tiến trình' };
    }

    const currentProgress: StudentNodeProgress | undefined = existingRow
      ? {
          nodeId: existingRow.node_id,
          worldId: existingRow.world_id,
          stars: existingRow.stars,
          highScore: existingRow.high_score,
          attempts: existingRow.attempts,
          isCompleted: existingRow.is_completed,
          completedAt: existingRow.completed_at || undefined,
        }
      : undefined;

    // 2. Calculate attempt stars and merged progress
    const attemptStars = calculateNodeStars(score, totalQuestions);
    const mergedProgress = mergeNodeProgress(
      currentProgress,
      score,
      totalQuestions,
      cleanNodeId,
      cleanWorldId
    );

    // 3. Upsert into student_roadmap_progress
    const { error: upsertError } = await supabase
      .from('student_roadmap_progress')
      .upsert(
        {
          student_id: studentId,
          world_id: mergedProgress.worldId,
          node_id: mergedProgress.nodeId,
          stars: mergedProgress.stars,
          high_score: mergedProgress.highScore,
          attempts: mergedProgress.attempts,
          is_completed: mergedProgress.isCompleted,
          completed_at: mergedProgress.completedAt || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,node_id' }
      );

    if (upsertError) {
      console.error('[recordRoadmapNodeCompletionAction] Upsert error:', upsertError);
      return { success: false, error: 'Lỗi khi lưu tiến trình học tập' };
    }

    // 4. Gamification bonus stars update if 3 stars earned on this attempt
    if (attemptStars === 3) {
      try {
        const { data: gamRow } = await supabase
          .from('student_gamification')
          .select('id, inventory')
          .eq('student_id', studentId)
          .maybeSingle();

        if (gamRow) {
          const inventory = parseDbInventory(gamRow.inventory);
          const allNodes = (worldsData as RoadmapWorld[]).flatMap((w) => w.nodes);
          const targetNode = allNodes.find((n) => n.id === cleanNodeId);
          const bonusReward = targetNode?.bonusStars ?? 5;

          const updatedInventory: StudentInventory = {
            ...inventory,
            bonusStars: (inventory.bonusStars || 0) + bonusReward,
          };

          await supabase
            .from('student_gamification')
            .update({
              inventory: updatedInventory as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('student_id', studentId);
        }
      } catch (gamErr) {
        console.warn('[recordRoadmapNodeCompletionAction] Gamification bonus stars update skipped:', gamErr);
      }
    }

    return {
      success: true,
      stars: attemptStars,
      updatedNode: mergedProgress,
    };
  } catch (err) {
    console.error('[recordRoadmapNodeCompletionAction] Unexpected exception:', err);
    return { success: false, error: 'Đã xảy ra lỗi không xác định' };
  }
}

/**
 * 3. Bulk sync offline/localStorage roadmap progress to database.
 */
export async function syncLocalRoadmapProgressAction(
  classCode: string,
  studentName: string,
  localProgress: Record<string, StudentNodeProgress>
): Promise<{ success: boolean; syncedCount?: number; error?: string }> {
  try {
    if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
      return { success: false, error: 'Mã lớp không được để trống' };
    }
    if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
      return { success: false, error: 'Tên học sinh không được để trống' };
    }
    if (!localProgress || typeof localProgress !== 'object') {
      return { success: false, error: 'Dữ liệu tiến trình không hợp lệ' };
    }

    const entries = Object.values(localProgress).filter(
      (entry) =>
        entry &&
        typeof entry.nodeId === 'string' &&
        typeof entry.worldId === 'string' &&
        typeof entry.stars === 'number'
    );

    if (entries.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    const supabase = createAdminClient();
    const { studentId, error } = await verifyAndGetStudent(classCode, studentName, supabase, true);
    if (error || !studentId) {
      return { success: false, error: error || 'Không tìm thấy học sinh' };
    }

    // Fetch existing records for these nodes
    const nodeIds = entries.map((e) => e.nodeId);
    const { data: existingRows, error: fetchError } = await supabase
      .from('student_roadmap_progress')
      .select('*')
      .eq('student_id', studentId)
      .in('node_id', nodeIds);

    if (fetchError) {
      console.error('[syncLocalRoadmapProgressAction] Error querying existing progress:', fetchError);
      return { success: false, error: 'Lỗi khi tải tiến trình' };
    }

    const existingMap = new Map<string, Database['public']['Tables']['student_roadmap_progress']['Row']>();
    for (const row of existingRows || []) {
      existingMap.set(row.node_id, row);
    }

    const now = new Date().toISOString();
    const upsertRows = entries.map((entry) => {
      const existing = existingMap.get(entry.nodeId);
      if (!existing) {
        return {
          student_id: studentId,
          world_id: entry.worldId,
          node_id: entry.nodeId,
          stars: Math.min(3, Math.max(0, entry.stars || 0)),
          high_score: Math.max(0, entry.highScore || 0),
          attempts: Math.max(1, entry.attempts || 1),
          is_completed: Boolean(entry.isCompleted || (entry.stars && entry.stars >= 1)),
          completed_at: entry.completedAt || (entry.isCompleted ? now : null),
          updated_at: now,
        };
      }

      const mergedStars = Math.max(existing.stars, entry.stars || 0);
      const mergedHighScore = Math.max(existing.high_score, entry.highScore || 0);
      const mergedAttempts = Math.max(existing.attempts, entry.attempts || 1);
      const isCompleted = existing.is_completed || Boolean(entry.isCompleted) || mergedStars >= 1;
      const completedAt = existing.completed_at || entry.completedAt || (isCompleted ? now : null);

      return {
        student_id: studentId,
        world_id: entry.worldId,
        node_id: entry.nodeId,
        stars: mergedStars,
        high_score: mergedHighScore,
        attempts: mergedAttempts,
        is_completed: isCompleted,
        completed_at: completedAt,
        updated_at: now,
      };
    });

    const { error: upsertError } = await supabase
      .from('student_roadmap_progress')
      .upsert(upsertRows, { onConflict: 'student_id,node_id' });

    if (upsertError) {
      console.error('[syncLocalRoadmapProgressAction] Upsert error:', upsertError);
      return { success: false, error: 'Lỗi khi đồng bộ tiến trình' };
    }

    return {
      success: true,
      syncedCount: upsertRows.length,
    };
  } catch (err) {
    console.error('[syncLocalRoadmapProgressAction] Unexpected exception:', err);
    return { success: false, error: 'Đã xảy ra lỗi không xác định' };
  }
}

/**
 * 4. Teacher analytics: aggregated class roadmap overview, world completions, and bottleneck nodes.
 */
export async function getClassRoadmapOverviewAction(
  classroomId: string
): Promise<{ success: boolean; data?: ClassRoadmapOverview; error?: string }> {
  try {
    if (!classroomId || typeof classroomId !== 'string' || !classroomId.trim()) {
      return { success: false, error: 'Mã lớp học không hợp lệ' };
    }

    const cleanClassroomId = classroomId.trim();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để xem tổng quan lộ trình' };
    }

    // Verify teacher owns the classroom
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, teacher_id')
      .eq('id', cleanClassroomId)
      .eq('teacher_id', user.id)
      .single();

    if (classError || !classroom) {
      return { success: false, error: 'Không tìm thấy lớp học hoặc bạn không có quyền truy cập' };
    }

    // Fetch students in classroom
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('classroom_id', cleanClassroomId);

    if (studentsError) {
      console.error('[getClassRoadmapOverviewAction] Error fetching students:', studentsError);
      return { success: false, error: 'Lỗi khi tải danh sách học sinh' };
    }

    const studentList = students || [];
    const totalStudents = studentList.length;
    const worlds = worldsData as RoadmapWorld[];

    if (totalStudents === 0) {
      return {
        success: true,
        data: {
          totalStudents: 0,
          worldProgress: worlds.map((w) => ({
            worldId: w.id,
            titleVi: w.titleVi,
            completionRate: 0,
            averageStars: 0,
          })),
          bottleneckNodes: [],
          studentsProgress: [],
        },
      };
    }

    const studentIds = studentList.map((s) => s.id);
    const { data: progressRows, error: progressError } = await supabase
      .from('student_roadmap_progress')
      .select('*')
      .in('student_id', studentIds);

    if (progressError) {
      console.error('[getClassRoadmapOverviewAction] Error fetching roadmap progress:', progressError);
      return { success: false, error: 'Lỗi khi tải tiến trình học sinh' };
    }

    const allProgress = progressRows || [];

    // 1. World Progress calculation
    const worldProgress: WorldProgressOverview[] = worlds.map((world) => {
      const worldRows = allProgress.filter((r) => r.world_id === world.id);
      const totalPossibleNodeCompletions = totalStudents * (world.nodes.length || 1);
      const completedCount = worldRows.filter((r) => r.is_completed).length;
      const completionRate =
        totalPossibleNodeCompletions > 0
          ? Math.min(100, Math.round((completedCount / totalPossibleNodeCompletions) * 100))
          : 0;

      const totalStars = worldRows.reduce((sum, r) => sum + (r.stars || 0), 0);
      const averageStars =
        worldRows.length > 0 ? Number((totalStars / worldRows.length).toFixed(1)) : 0;

      return {
        worldId: world.id,
        titleVi: world.titleVi,
        completionRate,
        averageStars,
      };
    });

    // 2. Bottleneck Nodes calculation
    const allCurriculumNodes = worlds.flatMap((w) => w.nodes);
    const nodeMap = new Map(allCurriculumNodes.map((n) => [n.id, n]));

    const nodeProgressMap = new Map<string, typeof allProgress>();
    for (const row of allProgress) {
      const list = nodeProgressMap.get(row.node_id) || [];
      list.push(row);
      nodeProgressMap.set(row.node_id, list);
    }

    const bottleneckNodes: BottleneckNodeOverview[] = [];

    for (const [nodeId, rows] of nodeProgressMap.entries()) {
      if (rows.length === 0) continue;
      const failedCount = rows.filter((r) => !r.is_completed || r.stars === 0).length;
      const failRate = Math.round((failedCount / rows.length) * 100);
      if (failRate > 0) {
        const nodeInfo = nodeMap.get(nodeId);
        bottleneckNodes.push({
          nodeId,
          titleVi: nodeInfo?.titleVi || nodeId,
          failRate,
        });
      }
    }

    bottleneckNodes.sort((a, b) => b.failRate - a.failRate);

    // 3. Students progress summary
    const studentsProgress: StudentRoadmapSummary[] = studentList.map((student) => {
      const studentRows = allProgress.filter((r) => r.student_id === student.id);
      const completedNodesCount = studentRows.filter((r) => r.is_completed).length;
      const totalStars = studentRows.reduce((sum, r) => sum + (r.stars || 0), 0);
      return {
        studentId: student.id,
        studentName: student.name,
        completedNodesCount,
        totalStars,
      };
    });

    return {
      success: true,
      data: {
        totalStudents,
        worldProgress,
        bottleneckNodes,
        studentsProgress,
      },
    };
  } catch (err) {
    console.error('[getClassRoadmapOverviewAction] Unexpected exception:', err);
    return { success: false, error: 'Đã xảy ra lỗi không xác định' };
  }
}
