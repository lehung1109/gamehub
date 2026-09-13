// src/lib/ai-copilot-generator.ts

import type { ArenaQuestion } from '@/types/arena'
import type {
  GenerateArenaPromptInput,
  GeneratedArenaPayload,
  CopilotLessonPlan,
} from '@/types/ai-copilot'

interface TopicContent {
  title: string
  questions: Array<Omit<ArenaQuestion, 'id'>>
}

const TOPIC_PRESETS: Record<string, TopicContent> = {
  animals: {
    title: 'Đấu Trường Động Vật Hoang Dã (Animal Kingdom)',
    questions: [
      {
        question: 'Which animal is known as the King of the Jungle?',
        options: ['Lion', 'Tiger', 'Elephant', 'Giraffe'],
        correctAnswer: 'Lion',
        explanation: 'The lion is traditionally called the King of the Jungle.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'Cheetahs are the fastest land animals in the world.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Cheetahs can run up to 120 km/h!',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
      {
        question: 'Nghe phát âm và chọn con vật có âm đuôi /t/: "Cat"',
        options: ['Cat', 'Dog', 'Bear', 'Lion'],
        correctAnswer: 'Cat',
        explanation: 'Từ "Cat" kết thúc bằng phụ âm bật hơi /t/.',
        timeLimitSeconds: 15,
        points: 1200,
        questionType: 'phonics_audio',
      },
      {
        question: 'Where do polar bears live?',
        options: ['Arctic (Bắc Cực)', 'Desert (Sa mạc)', 'Jungle (Rừng rậm)', 'Ocean (Đại dương)'],
        correctAnswer: 'Arctic (Bắc Cực)',
        explanation: 'Polar bears live in the cold icy Arctic regions.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'Penguins can fly in the sky like eagles.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Penguins cannot fly; they are skilled swimmers!',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
      {
        question: 'Nghe phát âm và chọn từ có âm đuôi /k/: "Duck"',
        options: ['Duck', 'Fish', 'Frog', 'Bird'],
        correctAnswer: 'Duck',
        explanation: 'Từ "Duck" kết thúc bằng âm đuôi /k/.',
        timeLimitSeconds: 15,
        points: 1200,
        questionType: 'phonics_audio',
      },
      {
        question: 'Which sea creature has eight arms?',
        options: ['Octopus', 'Dolphin', 'Shark', 'Whale'],
        correctAnswer: 'Octopus',
        explanation: 'An octopus has 8 arms with suction cups.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'Dolphins are mammals, not fish.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Dolphins breathe air using blowholes and nurse their young.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
    ],
  },
  school: {
    title: 'Đấu Trường Đồ Dùng Học Tập (School Supplies)',
    questions: [
      {
        question: 'What do you use to write notes in your notebook?',
        options: ['Pen', 'Eraser', 'Ruler', 'Backpack'],
        correctAnswer: 'Pen',
        explanation: 'You use a pen or pencil to write notes.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'An eraser is used to draw straight lines.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'A ruler is used to draw straight lines, an eraser removes pencil marks.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
      {
        question: 'Nghe phát âm và chọn từ có âm đuôi /k/: "Book"',
        options: ['Book', 'Pen', 'Pencil', 'Ruler'],
        correctAnswer: 'Book',
        explanation: 'Từ "Book" kết thúc bằng âm đuôi /k/.',
        timeLimitSeconds: 15,
        points: 1200,
        questionType: 'phonics_audio',
      },
      {
        question: 'Where do you keep your books and stationery when going to school?',
        options: ['Backpack', 'Pencil case', 'Desk', 'Chair'],
        correctAnswer: 'Backpack',
        explanation: 'A backpack holds all school items when commuting.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'A sharpener makes blunt pencils sharp again.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Pencil sharpeners create a sharp graphite point.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
      {
        question: 'Nghe phát âm và chọn từ có âm /s/: "Pencil case"',
        options: ['Pencil case', 'Pen', 'Book', 'Ruler'],
        correctAnswer: 'Pencil case',
        explanation: 'Từ "Pencil case" chứa các âm /s/ rõ ràng.',
        timeLimitSeconds: 15,
        points: 1200,
        questionType: 'phonics_audio',
      },
    ],
  },
  general: {
    title: 'Đấu Trường Thử Thách Tiếng Anh Tổng Hợp',
    questions: [
      {
        question: 'What is the color of the sun during midday?',
        options: ['Yellow', 'Blue', 'Green', 'Purple'],
        correctAnswer: 'Yellow',
        explanation: 'The sun appears bright yellow in daytime.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'There are seven days in one week.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Monday through Sunday equals 7 days.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
      {
        question: 'Nghe phát âm và chọn từ có âm đuôi /k/: "Like"',
        options: ['Like', 'Love', 'Play', 'Go'],
        correctAnswer: 'Like',
        explanation: 'Từ "Like" có âm đuôi /k/ rõ ràng.',
        timeLimitSeconds: 15,
        points: 1200,
        questionType: 'phonics_audio',
      },
      {
        question: 'How many months are there in a year?',
        options: ['12', '10', '14', '7'],
        correctAnswer: '12',
        explanation: 'There are 12 months in a standard year.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'multiple_choice',
      },
      {
        question: 'Water boils at 100 degrees Celsius.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Water reaches its boiling point at 100°C.',
        timeLimitSeconds: 15,
        points: 1000,
        questionType: 'true_false',
      },
    ],
  },
}

function parsePromptMetadata(prompt: string) {
  const lower = prompt.toLowerCase()

  // 1. Inferred question count
  const countMatch = lower.match(/(\d+)\s*(câu|bài|question|item)/i)
  const inferredCount = countMatch ? parseInt(countMatch[1], 10) : 5
  const count = Math.max(3, Math.min(15, inferredCount))

  // 2. Inferred grade level
  let gradeLevel = 'grade-3'
  if (lower.includes('lớp 1') || lower.includes('grade 1')) gradeLevel = 'grade-1'
  else if (lower.includes('lớp 2') || lower.includes('grade 2')) gradeLevel = 'grade-2'
  else if (lower.includes('lớp 3') || lower.includes('grade 3')) gradeLevel = 'grade-3'
  else if (lower.includes('lớp 4') || lower.includes('grade 4')) gradeLevel = 'grade-4'
  else if (lower.includes('lớp 5') || lower.includes('grade 5')) gradeLevel = 'grade-5'

  // 3. Inferred topic
  let topic = 'general'
  if (lower.includes('animal') || lower.includes('động vật') || lower.includes('thú cưng')) {
    topic = 'animals'
  } else if (
    lower.includes('school') ||
    lower.includes('học tập') ||
    lower.includes('đồ dùng') ||
    lower.includes('supplies')
  ) {
    topic = 'school'
  }

  return { count, gradeLevel, topic }
}

/**
 * AI Classroom Co-Pilot: Generates structured Live Arena questions from a teacher's prompt
 */
export function generateArenaQuestionsFromPrompt(
  input: GenerateArenaPromptInput
): GeneratedArenaPayload {
  const meta = parsePromptMetadata(input.prompt)
  const effectiveCount = input.questionCount || meta.count
  const effectiveGrade = input.gradeLevel || meta.gradeLevel
  const topicKey = meta.topic

  const preset = TOPIC_PRESETS[topicKey] || TOPIC_PRESETS.general
  const baseQuestions = preset.questions

  // Build requested count of questions ensuring polymorphic mix
  const generatedQuestions: ArenaQuestion[] = []

  for (let i = 0; i < effectiveCount; i++) {
    const template = baseQuestions[i % baseQuestions.length]
    generatedQuestions.push({
      ...template,
      id: `ai-q-${Date.now()}-${i + 1}`,
    })
  }

  return {
    title: preset.title,
    topic: topicKey,
    gradeLevel: effectiveGrade,
    questions: generatedQuestions,
  }
}

/**
 * AI Classroom Co-Pilot: Generates a targeted 15-minute remediation lesson plan
 */
export function generateRemediationLessonPlan(
  topic: string,
  gradeLevel: string,
  targetPhonemes: string[] = ['/s/', '/k/']
): CopilotLessonPlan {
  // Select matching tongue twister based on focus phonemes
  let tongueTwister = 'Six slippery snakes slithered silently south.'
  if (targetPhonemes.includes('/k/')) {
    tongueTwister = 'Cute cats catch quick crickets in the kitchen.'
  } else if (targetPhonemes.includes('/θ/') || targetPhonemes.includes('/ð/')) {
    tongueTwister = 'Three thick thieves thought through thirty-three things.'
  } else if (targetPhonemes.includes('/ʃ/')) {
    tongueTwister = 'She sells sea shells by the seashore.'
  }

  const scriptVi = `
1. Khởi động (0 - 3 phút):
   - Thầy/Cô: "Chào cả lớp! Hôm nay chúng ta sẽ làm thợ săn âm thanh với thử thách câu đố nhanh: '${tongueTwister}'!"
   - Cho cả lớp đọc đồng thanh 3 lần từ chậm đến nhanh.

2. Hướng dẫn kỹ thuật phát âm (3 - 8 phút):
   - Minh họa vị trí lưỡi và luồng hơi cho âm ${targetPhonemes.join(' và ')}.
   - Nhắc nhở lỗi nuốt âm đuôi: Không được bỏ quên phụ âm cuối của từ tiếng Anh.

3. Luyện tập tương tác (8 - 15 phút):
   - Mở mini-game Pronunciation hoặc Đấu trường Live Arena trên GameHub.
   - Thưởng sao danh dự cho các bạn phát âm rõ âm đuôi.
`.trim()

  return {
    id: `plan-${Date.now()}`,
    title: `Giáo án Khắc phục Lỗi Âm (${targetPhonemes.join(', ')})`,
    targetGrade: gradeLevel,
    durationMinutes: 15,
    focusPhonemes: targetPhonemes,
    warmUpTongueTwister: tongueTwister,
    interactiveActivity:
      'Trò chơi "Thợ Săn Âm Đuôi" (Final Sound Hunters): Học sinh vỗ tay hai lần khi nghe thấy âm đuôi được bật hơi rõ ràng.',
    recommendedGames: ['pronunciation', 'flashcard', 'speaking'],
    teacherScriptVi: scriptVi,
  }
}
