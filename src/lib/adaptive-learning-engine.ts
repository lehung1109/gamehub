// src/lib/adaptive-learning-engine.ts

import type {
  SkillDomain,
  SkillNode,
  CefrLevel,
  StudentDiagnosticProfile,
  AdaptiveDailyPlan,
  AdaptiveDailyPackStep,
  ClassDiagnosticSummary,
  StudentDiagnosticRow,
  StudentTier,
} from '@/types/adaptive-learning'

export const SKILL_NODE_CATALOG: SkillNode[] = [
  // 1. Phonics & Pronunciation
  {
    id: 'ph-ending-sounds',
    domain: 'phonics',
    nameVi: 'Bật âm đuôi (/s/, /k/, /t/, /d/)',
    descriptionVi: 'Phát âm chuẩn xác và không nuốt âm đuôi phụ âm',
    targetGameId: 'pronunciation',
    targetTopicId: 'minimal-pairs',
    defaultThreshold: 70,
  },
  {
    id: 'ph-vowels-diphthongs',
    domain: 'phonics',
    nameVi: 'Nguyên âm và nguyên âm đôi',
    descriptionVi: 'Phân biệt nguyên âm ngắn và dài chuẩn IPA',
    targetGameId: 'alphabet',
    defaultThreshold: 75,
  },
  {
    id: 'ph-fricatives-clusters',
    domain: 'phonics',
    nameVi: 'Âm xát và phụ âm ghép (/θ/, /ð/, /ʃ/)',
    descriptionVi: 'Luyện cơ miệng phát âm phụ âm ghép khó',
    targetGameId: 'pronunciation',
    targetTopicId: 'workplace-words',
    defaultThreshold: 70,
  },

  // 2. Vocabulary Acquisition
  {
    id: 'voc-everyday-basics',
    domain: 'vocabulary',
    nameVi: 'Từ vựng sinh hoạt thường ngày',
    descriptionVi: 'Nhận diện đồ dùng, gia đình, màu sắc và số đếm',
    targetGameId: 'flashcard',
    targetTopicId: 'daily-words',
    defaultThreshold: 80,
  },
  {
    id: 'voc-animals-nature',
    domain: 'vocabulary',
    nameVi: 'Động vật và thế giới tự nhiên',
    descriptionVi: 'Từ vựng chủ đề muôn thú và môi trường sống',
    targetGameId: 'spelling',
    targetTopicId: 'animals',
    defaultThreshold: 75,
  },
  {
    id: 'voc-actions-jobs',
    domain: 'vocabulary',
    nameVi: 'Hành động và nghề nghiệp',
    descriptionVi: 'Từ vựng miêu tả công việc và hoạt động thể thao',
    targetGameId: 'word-search',
    defaultThreshold: 75,
  },

  // 3. Grammar & Syntax
  {
    id: 'grm-word-order',
    domain: 'grammar',
    nameVi: 'Trật tự từ trong câu đơn (S-V-O)',
    descriptionVi: 'Sắp xếp trật tự từ Chủ ngữ - Động từ - Tân ngữ chuẩn ngữ pháp',
    targetGameId: 'sentences',
    defaultThreshold: 75,
  },
  {
    id: 'grm-present-simple',
    domain: 'grammar',
    nameVi: 'Thì hiện tại đơn và chia động từ',
    descriptionVi: 'Quy tắc thêm s/es cho ngôi thứ ba số ít',
    targetGameId: 'tenses',
    targetTopicId: 'present-simple',
    defaultThreshold: 70,
  },
  {
    id: 'grm-parts-of-speech',
    domain: 'grammar',
    nameVi: 'Nhận diện danh từ & động từ',
    descriptionVi: 'Phân loại từ loại và tìm lỗi sai ngữ pháp',
    targetGameId: 'grammar-detective',
    defaultThreshold: 75,
  },

  // 4. Listening & Reflex
  {
    id: 'lis-sound-discrim',
    domain: 'listening',
    nameVi: 'Phân biệt âm thanh & nghe từ vựng',
    descriptionVi: 'Nhận diện từ chính xác qua ngữ điệu bản xứ',
    targetGameId: 'listening',
    defaultThreshold: 75,
  },
  {
    id: 'lis-sentence-comprehension',
    domain: 'listening',
    nameVi: 'Nghe hiểu câu và phản xạ',
    descriptionVi: 'Hiểu ngữ cảnh câu nói và suy luận loại trừ',
    targetGameId: 'odd-one-out',
    defaultThreshold: 70,
  },
]

/**
 * Calculates Dynamic Difficulty Adjustment (DDA) multiplier
 * 1.2 = Challenge Mode (high performers)
 * 1.0 = Standard Mode
 * 0.8 = Scaffolding Support Mode (struggling students)
 */
export function calculateDdaMultiplier(recentAccuracy: number): number {
  if (recentAccuracy >= 85) return 1.2
  if (recentAccuracy >= 60) return 1.0
  return 0.8
}

/**
 * Estimates CEFR level based on overall mastery score
 */
export function estimateCefrLevel(overallScore: number): CefrLevel {
  if (overallScore >= 90) return 'A2.2'
  if (overallScore >= 80) return 'A2.1'
  if (overallScore >= 70) return 'A1.2'
  if (overallScore >= 55) return 'A1.1'
  return 'Pre-A1'
}

/**
 * Evaluates student attempts across knowledge nodes and builds their diagnostic profile
 */
export function evaluateStudentSkillProfile(
  studentId: string,
  studentName: string,
  attempts: Array<{ skillId: string; isCorrect: boolean }> = []
): StudentDiagnosticProfile {
  // Map attempts to skills
  const attemptsBySkill = new Map<string, { correct: number; total: number }>()

  attempts.forEach((att) => {
    const curr = attemptsBySkill.get(att.skillId) || { correct: 0, total: 0 }
    attemptsBySkill.set(att.skillId, {
      correct: curr.correct + (att.isCorrect ? 1 : 0),
      total: curr.total + 1,
    })
  })

  // Calculate score per node
  const domainScoreSums: Record<SkillDomain, { sum: number; count: number }> = {
    phonics: { sum: 0, count: 0 },
    vocabulary: { sum: 0, count: 0 },
    grammar: { sum: 0, count: 0 },
    listening: { sum: 0, count: 0 },
  }

  const weakNodes: SkillNode[] = []
  const strongNodes: SkillNode[] = []
  let totalOverallScore = 0

  SKILL_NODE_CATALOG.forEach((node) => {
    const stat = attemptsBySkill.get(node.id)
    // If no attempts, default to 70% baseline
    const score = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 70

    domainScoreSums[node.domain].sum += score
    domainScoreSums[node.domain].count += 1
    totalOverallScore += score

    if (score < node.defaultThreshold) {
      weakNodes.push(node)
    } else if (score >= 80) {
      strongNodes.push(node)
    }
  })

  // Fallback: if no weak nodes under threshold, designate the lowest scoring one
  if (weakNodes.length === 0 && SKILL_NODE_CATALOG.length > 0) {
    weakNodes.push(SKILL_NODE_CATALOG[0])
  }

  const domainScores: Record<SkillDomain, number> = {
    phonics: Math.round(domainScoreSums.phonics.sum / Math.max(1, domainScoreSums.phonics.count)),
    vocabulary: Math.round(domainScoreSums.vocabulary.sum / Math.max(1, domainScoreSums.vocabulary.count)),
    grammar: Math.round(domainScoreSums.grammar.sum / Math.max(1, domainScoreSums.grammar.count)),
    listening: Math.round(domainScoreSums.listening.sum / Math.max(1, domainScoreSums.listening.count)),
  }

  const overallMastery = Math.round(totalOverallScore / SKILL_NODE_CATALOG.length)
  const estimatedCefrLevel = estimateCefrLevel(overallMastery)
  const ddaMultiplier = calculateDdaMultiplier(overallMastery)

  return {
    studentId,
    studentName,
    domainScores,
    weakNodes,
    strongNodes,
    estimatedCefrLevel,
    ddaMultiplier,
    overallMastery,
  }
}

/**
 * Generates the tailored 3-step Daily Power Pack from the diagnostic profile
 */
export function generateAdaptiveDailyPlan(
  profile: StudentDiagnosticProfile,
  dateString: string = new Date().toISOString().split('T')[0]
): AdaptiveDailyPlan {
  const primaryWeakNode = profile.weakNodes[0] || SKILL_NODE_CATALOG[0]
  const secondaryWeakNode = profile.weakNodes[1] || SKILL_NODE_CATALOG[6] // fallback to sentence grammar

  const steps: AdaptiveDailyPackStep[] = [
    {
      stepNumber: 1,
      type: 'warm_up',
      titleVi: `Khởi động: ${primaryWeakNode.nameVi}`,
      descriptionVi: `Khắc phục điểm yếu phát âm và củng cố phản xạ âm (3 phút)`,
      targetGameId: primaryWeakNode.targetGameId,
      targetUrl: `/games/${primaryWeakNode.targetGameId}${
        primaryWeakNode.targetTopicId ? `?topic=${primaryWeakNode.targetTopicId}` : ''
      }`,
      targetTopic: primaryWeakNode.targetTopicId,
      expReward: 10,
      isCompleted: false,
    },
    {
      stepNumber: 2,
      type: 'core_drill',
      titleVi: `Luyện tập cốt lõi: ${secondaryWeakNode.nameVi}`,
      descriptionVi: `Rèn luyện chuyên sâu với độ khó thích ứng ${profile.ddaMultiplier}x (5 phút)`,
      targetGameId: secondaryWeakNode.targetGameId,
      targetUrl: `/games/${secondaryWeakNode.targetGameId}${
        secondaryWeakNode.targetTopicId ? `?topic=${secondaryWeakNode.targetTopicId}` : ''
      }`,
      targetTopic: secondaryWeakNode.targetTopicId,
      expReward: 20,
      isCompleted: false,
    },
    {
      stepNumber: 3,
      type: 'boss_challenge',
      titleVi: 'Thử thách phản xạ đỉnh cao',
      descriptionVi: 'Chinh phục 3 câu đố tốc độ để nhận trọn vẹn huân chương ngày (2 phút)',
      targetGameId: 'falling-words',
      targetUrl: '/games/falling-words',
      expReward: 30,
      isCompleted: false,
    },
  ]

  return {
    id: `plan-${profile.studentId}-${dateString}`,
    date: dateString,
    studentId: profile.studentId,
    steps,
    totalExpReward: 60,
    isFullyCompleted: false,
  }
}

/**
 * Aggregates diagnostic profiles into a class-wide summary with tiers and weak node frequencies
 */
export function generateClassDiagnosticSummary(
  profiles: StudentDiagnosticProfile[],
  classId: string,
  className: string
): ClassDiagnosticSummary {
  const count = profiles.length
  if (count === 0) {
    return {
      classId,
      className,
      studentCount: 0,
      domainAverages: { phonics: 0, vocabulary: 0, grammar: 0, listening: 0 },
      weakSkillFrequencies: [],
      studentRows: [],
    }
  }

  const domainTotals: Record<SkillDomain, number> = {
    phonics: 0,
    vocabulary: 0,
    grammar: 0,
    listening: 0,
  }

  const weakFrequencyMap = new Map<string, { nameVi: string; count: number }>()

  const studentRows: StudentDiagnosticRow[] = profiles.map((p) => {
    domainTotals.phonics += p.domainScores.phonics
    domainTotals.vocabulary += p.domainScores.vocabulary
    domainTotals.grammar += p.domainScores.grammar
    domainTotals.listening += p.domainScores.listening

    p.weakNodes.forEach((node) => {
      const curr = weakFrequencyMap.get(node.id) || { nameVi: node.nameVi, count: 0 }
      weakFrequencyMap.set(node.id, { nameVi: node.nameVi, count: curr.count + 1 })
    })

    let tier: StudentTier = 'target'
    if (p.overallMastery >= 80) tier = 'advanced'
    else if (p.overallMastery < 60) tier = 'support'

    return {
      studentId: p.studentId,
      studentName: p.studentName,
      overallScore: p.overallMastery,
      tier,
      domainScores: p.domainScores,
      primaryWeakSkill: p.weakNodes[0]?.nameVi || 'Chưa ghi nhận',
    }
  })

  const weakSkillFrequencies = Array.from(weakFrequencyMap.entries())
    .map(([skillId, data]) => ({
      skillId,
      skillNameVi: data.nameVi,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    classId,
    className,
    studentCount: count,
    domainAverages: {
      phonics: Math.round(domainTotals.phonics / count),
      vocabulary: Math.round(domainTotals.vocabulary / count),
      grammar: Math.round(domainTotals.grammar / count),
      listening: Math.round(domainTotals.listening / count),
    },
    weakSkillFrequencies,
    studentRows,
  }
}
