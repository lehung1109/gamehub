// src/lib/ai-generator.ts

import type {
  AiGeneratedVocabItem,
  AiGeneratedReadingPassage,
  AiGeneratedReadingQuestion,
  AiGeneratedGrammarItem,
  AiGenerateVocabInput,
  AiGenerateReadingInput,
  AiGenerateGrammarInput,
} from '@/types/ai-generator'
import type { PartOfSpeech } from '@/types/word-bank'
import curriculumData from '@/data/curriculum-lexicon.json'

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'item_' + Math.random().toString(36).substring(2, 11)
}

const COMMON_DISTRACTORS: Record<string, string[]> = {
  animals: ['Sư tử biển', 'Cá sấu', 'Hươu sao', 'Gấu mèo', 'Đà điểu', 'Cáo đỏ'],
  school: ['Thước đo độ', 'Cặp sách', 'Bảng phụ', 'Học bạ', 'Phấn viết', 'Giấy kiểm tra'],
  nature: ['Bình minh', 'Bụi hoa rực rỡ', 'Thác nước', 'Suối khoáng', 'Thảo nguyên', 'Gió bão'],
  technology: ['Đường truyền quang', 'Mã nguồn mở', 'Màn hình cảm ứng', 'Vi xử lý', 'Cổng kết nối'],
  general: ['Khái niệm mới', 'Thực tế khách quan', 'Giải pháp sáng tạo', 'Hành động nhanh chóng', 'Kết quả khả quan'],
}

/**
 * Deterministic offline pedagogical generator for vocabulary
 */
export function generateOfflineVocabulary(input: AiGenerateVocabInput): AiGeneratedVocabItem[] {
  const count = input.count && input.count > 0 ? input.count : 5
  const normalizedTopic = input.topic.trim().toLowerCase()
  const requestedCefr = input.cefrLevel

  // Filter curated words by topic
  const matchingTopicWords = curriculumData.vocab.filter(
    (w) => w.topic.toLowerCase() === normalizedTopic
  )

  const candidatePool = matchingTopicWords.length > 0 ? matchingTopicWords : curriculumData.vocab

  const results: AiGeneratedVocabItem[] = []

  // Prefer exact CEFR level if available
  const exactCefr = candidatePool.filter((w) => w.cefrLevel === requestedCefr)
  const pool = exactCefr.length > 0 ? exactCefr : candidatePool

  for (let i = 0; i < count; i++) {
    const template = pool[i % pool.length]
    const itemDistractors = [...template.distractors]

    // Ensure distractors do not contain correct Vietnamese translation
    const filteredDistractors = itemDistractors.filter(
      (d) => d.toLowerCase().trim() !== template.vietnamese.toLowerCase().trim()
    )

    // Ensure at least 3 distractors
    const extraDistractors = COMMON_DISTRACTORS[normalizedTopic] || COMMON_DISTRACTORS.general
    for (const extra of extraDistractors) {
      if (filteredDistractors.length >= 3) break
      if (!filteredDistractors.includes(extra) && extra !== template.vietnamese) {
        filteredDistractors.push(extra)
      }
    }

    results.push({
      id: generateId(),
      english: template.english,
      vietnamese: template.vietnamese,
      phonetic: template.phonetic,
      partOfSpeech: template.partOfSpeech as PartOfSpeech,
      cefrLevel: requestedCefr,
      topic: normalizedTopic || template.topic,
      emoji: template.emoji,
      exampleSentence: template.exampleSentence,
      exampleTranslation: template.exampleTranslation,
      distractors: filteredDistractors.slice(0, 3),
    })
  }

  return results
}

/**
 * Deterministic offline pedagogical generator for reading passages
 */
export function generateOfflineReading(input: AiGenerateReadingInput): AiGeneratedReadingPassage {
  const normalizedTopic = input.topic.trim().toLowerCase()
  const requestedCefr = input.cefrLevel
  const questionCount = input.questionCount && input.questionCount > 0 ? input.questionCount : 3

  // Search for matching reading passage
  const matchingReading = curriculumData.readings.find(
    (r) => r.topic.toLowerCase() === normalizedTopic && r.cefrLevel === requestedCefr
  ) || curriculumData.readings.find((r) => r.topic.toLowerCase() === normalizedTopic) ||
    curriculumData.readings[0]

  const questions: AiGeneratedReadingQuestion[] = matchingReading.questions
    .slice(0, questionCount)
    .map((q) => ({
      id: generateId(),
      question: q.question,
      options: q.options.includes(q.correctAnswer)
        ? q.options
        : [q.correctAnswer, ...q.options.slice(0, 3)],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }))

  // If more questions are requested than available in template, synthesize plausible questions
  while (questions.length < questionCount) {
    const idx = questions.length + 1
    questions.push({
      id: generateId(),
      question: `What is a primary takeaway from this passage? (Point ${idx})`,
      options: [
        'Understanding key contextual details',
        'Skipping difficult vocabulary',
        'Reading as fast as possible without reflection',
        'Ignoring the main topic',
      ],
      correctAnswer: 'Understanding key contextual details',
      explanation: 'Careful contextual reading enables deep comprehension of the text.',
    })
  }

  return {
    title: matchingReading.title,
    passage: matchingReading.passage,
    vietnameseTranslation: matchingReading.vietnameseTranslation,
    cefrLevel: requestedCefr,
    topic: normalizedTopic || matchingReading.topic,
    questions,
  }
}

/**
 * Deterministic offline pedagogical generator for grammar items
 */
export function generateOfflineGrammar(input: AiGenerateGrammarInput): AiGeneratedGrammarItem[] {
  const count = input.count && input.count > 0 ? input.count : 4
  const focusRule = input.focusRule ? input.focusRule.trim().toLowerCase() : undefined

  let filteredGrammar = curriculumData.grammar
  if (focusRule) {
    const matched = curriculumData.grammar.filter((g) => g.rule.toLowerCase() === focusRule)
    if (matched.length > 0) {
      filteredGrammar = matched
    }
  }

  const results: AiGeneratedGrammarItem[] = []
  for (let i = 0; i < count; i++) {
    const item = filteredGrammar[i % filteredGrammar.length]
    results.push({
      id: generateId(),
      incorrectSentence: item.incorrectSentence,
      correctSentence: item.correctSentence,
      errorPart: item.errorPart,
      ruleExplanation: item.ruleExplanation,
      hint: item.hint,
    })
  }

  return results
}

/**
 * Call Gemini API endpoint with JSON formatting and timeout
 */
async function callGeminiApi<T>(prompt: string, apiKey: string): Promise<T> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    throw new Error('Gemini API response did not contain text')
  }

  return JSON.parse(rawText) as T
}

/**
 * Public API: Generate AI Vocabulary with Dual Engine Fallback
 */
export async function generateAiVocabulary(
  input: AiGenerateVocabInput
): Promise<AiGeneratedVocabItem[]> {
  const apiKey = process.env.GEMINI_API_KEY
  const count = input.count || 5

  if (apiKey) {
    try {
      const prompt = `Generate a JSON array of ${count} English vocabulary items for students learning English.
Topic: "${input.topic}". CEFR Level: "${input.cefrLevel}".
${input.customPrompt ? `Additional instructions: ${input.customPrompt}` : ''}
Return an array of objects matching this JSON schema:
[
  {
    "english": string (English word or phrase),
    "vietnamese": string (Accurate Vietnamese translation),
    "phonetic": string (IPA pronunciation),
    "partOfSpeech": "noun" | "verb" | "adjective" | "adverb" | "phrase",
    "cefrLevel": "${input.cefrLevel}",
    "topic": "${input.topic}",
    "emoji": string (A relevant emoji),
    "exampleSentence": string (A clear English example sentence suitable for this CEFR level),
    "exampleTranslation": string (Vietnamese translation of the example sentence),
    "distractors": string[] (At least 3 plausible incorrect Vietnamese translations, NOT including the correct translation)
  }
]`

      const items = await callGeminiApi<AiGeneratedVocabItem[]>(prompt, apiKey)
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: item.id || generateId(),
          cefrLevel: input.cefrLevel,
          topic: input.topic,
          distractors: (item.distractors || []).filter((d) => d !== item.vietnamese),
        }))
      }
    } catch (err) {
      console.warn('Gemini API call failed, activating offline pedagogical fallback:', err)
    }
  }

  return generateOfflineVocabulary(input)
}

/**
 * Public API: Generate AI Reading Passage with Dual Engine Fallback
 */
export async function generateAiReading(
  input: AiGenerateReadingInput
): Promise<AiGeneratedReadingPassage> {
  const apiKey = process.env.GEMINI_API_KEY
  const questionCount = input.questionCount || 3

  if (apiKey) {
    try {
      const prompt = `Generate an English reading passage and comprehension questions for students.
Topic: "${input.topic}". CEFR Level: "${input.cefrLevel}". Number of questions: ${questionCount}.
${input.customPrompt ? `Additional instructions: ${input.customPrompt}` : ''}
Return a JSON object matching this schema:
{
  "title": string,
  "passage": string (approx 80-150 words matching CEFR level),
  "vietnameseTranslation": string,
  "cefrLevel": "${input.cefrLevel}",
  "topic": "${input.topic}",
  "questions": [
    {
      "question": string,
      "options": string[] (4 options including the correct answer),
      "correctAnswer": string,
      "explanation": string
    }
  ]
}`

      const passage = await callGeminiApi<AiGeneratedReadingPassage>(prompt, apiKey)
      if (passage && passage.passage && Array.isArray(passage.questions)) {
        return {
          ...passage,
          cefrLevel: input.cefrLevel,
          topic: input.topic,
          questions: passage.questions.map((q) => ({
            ...q,
            id: generateId(),
            options: q.options.includes(q.correctAnswer)
              ? q.options
              : [q.correctAnswer, ...q.options.slice(0, 3)],
          })),
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed for reading, activating offline pedagogical fallback:', err)
    }
  }

  return generateOfflineReading(input)
}

/**
 * Public API: Generate AI Grammar Items with Dual Engine Fallback
 */
export async function generateAiGrammar(
  input: AiGenerateGrammarInput
): Promise<AiGeneratedGrammarItem[]> {
  const apiKey = process.env.GEMINI_API_KEY
  const count = input.count || 4

  if (apiKey) {
    try {
      const prompt = `Generate ${count} English grammar detective sentences containing common student errors.
${input.focusRule ? `Focus grammar rule: "${input.focusRule}".` : ''}
${input.customPrompt ? `Additional instructions: ${input.customPrompt}` : ''}
Return a JSON array of objects matching this schema:
[
  {
    "incorrectSentence": string (The sentence with exactly one grammatical error),
    "correctSentence": string (The corrected sentence),
    "errorPart": string (The specific word or phrase in incorrectSentence that is wrong),
    "ruleExplanation": string (Why it is wrong and what grammatical rule applies),
    "hint": string (A helpful clue for the student detective)
  }
]`

      const items = await callGeminiApi<AiGeneratedGrammarItem[]>(prompt, apiKey)
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item) => ({
          ...item,
          id: generateId(),
        }))
      }
    } catch (err) {
      console.warn('Gemini API call failed for grammar, activating offline pedagogical fallback:', err)
    }
  }

  return generateOfflineGrammar(input)
}
