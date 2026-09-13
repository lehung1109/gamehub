// src/lib/phoneme-evaluator.ts

import type {
  PhonemeBreakdown,
  PhonemeAssessmentResult,
  PhonemeStatus,
} from '@/types/ai-copilot'

export interface SegmentedPhoneme {
  phoneme: string
  ipa: string
  type: 'vowel' | 'consonant' | 'cluster'
  isEnding?: boolean
}

// Curated grapheme-to-phoneme dictionary for primary school vocabulary
const PHONEME_DICTIONARY: Record<string, SegmentedPhoneme[]> = {
  like: [
    { phoneme: 'l', ipa: '/l/', type: 'consonant' },
    { phoneme: 'i_e', ipa: '/aɪ/', type: 'vowel' },
    { phoneme: 'k', ipa: '/k/', type: 'consonant', isEnding: true },
  ],
  cat: [
    { phoneme: 'c', ipa: '/k/', type: 'consonant' },
    { phoneme: 'a', ipa: '/æ/', type: 'vowel' },
    { phoneme: 't', ipa: '/t/', type: 'consonant', isEnding: true },
  ],
  dog: [
    { phoneme: 'd', ipa: '/d/', type: 'consonant' },
    { phoneme: 'o', ipa: '/ɒ/', type: 'vowel' },
    { phoneme: 'g', ipa: '/ɡ/', type: 'consonant', isEnding: true },
  ],
  think: [
    { phoneme: 'th', ipa: '/θ/', type: 'consonant' },
    { phoneme: 'i', ipa: '/ɪ/', type: 'vowel' },
    { phoneme: 'nk', ipa: '/ŋk/', type: 'cluster', isEnding: true },
  ],
  this: [
    { phoneme: 'th', ipa: '/ð/', type: 'consonant' },
    { phoneme: 'i', ipa: '/ɪ/', type: 'vowel' },
    { phoneme: 's', ipa: '/s/', type: 'consonant', isEnding: true },
  ],
  that: [
    { phoneme: 'th', ipa: '/ð/', type: 'consonant' },
    { phoneme: 'a', ipa: '/æ/', type: 'vowel' },
    { phoneme: 't', ipa: '/t/', type: 'consonant', isEnding: true },
  ],
  she: [
    { phoneme: 'sh', ipa: '/ʃ/', type: 'consonant' },
    { phoneme: 'e', ipa: '/iː/', type: 'vowel' },
  ],
  fish: [
    { phoneme: 'f', ipa: '/f/', type: 'consonant' },
    { phoneme: 'i', ipa: '/ɪ/', type: 'vowel' },
    { phoneme: 'sh', ipa: '/ʃ/', type: 'consonant', isEnding: true },
  ],
  street: [
    { phoneme: 'str', ipa: '/str/', type: 'cluster' },
    { phoneme: 'ee', ipa: '/iː/', type: 'vowel' },
    { phoneme: 't', ipa: '/t/', type: 'consonant', isEnding: true },
  ],
  jump: [
    { phoneme: 'j', ipa: '/dʒ/', type: 'consonant' },
    { phoneme: 'u', ipa: '/ʌ/', type: 'vowel' },
    { phoneme: 'mp', ipa: '/mp/', type: 'cluster', isEnding: true },
  ],
  book: [
    { phoneme: 'b', ipa: '/b/', type: 'consonant' },
    { phoneme: 'oo', ipa: '/ʊ/', type: 'vowel' },
    { phoneme: 'k', ipa: '/k/', type: 'consonant', isEnding: true },
  ],
  apple: [
    { phoneme: 'a', ipa: '/æ/', type: 'vowel' },
    { phoneme: 'pp', ipa: '/p/', type: 'consonant' },
    { phoneme: 'le', ipa: '/əl/', type: 'consonant', isEnding: true },
  ],
}

function cleanText(str: string): string {
  return str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim()
}

/**
 * Segments an English word into phonemes (using lookup table with rule-based fallback)
 */
export function decomposeWordIntoPhonemes(word: string): SegmentedPhoneme[] {
  const cleaned = cleanText(word)
  if (!cleaned) return []

  if (PHONEME_DICTIONARY[cleaned]) {
    return PHONEME_DICTIONARY[cleaned]
  }

  // Fallback rule-based syllable decomposition (onset, nucleus, coda)
  const vowels = ['a', 'e', 'i', 'o', 'u']
  const result: SegmentedPhoneme[] = []

  let onset = ''
  let vowel = ''
  let coda = ''

  let phase: 'onset' | 'vowel' | 'coda' = 'onset'

  for (const ch of cleaned) {
    const isVowel = vowels.includes(ch)
    if (phase === 'onset') {
      if (!isVowel) {
        onset += ch
      } else {
        phase = 'vowel'
        vowel += ch
      }
    } else if (phase === 'vowel') {
      if (isVowel) {
        vowel += ch
      } else {
        phase = 'coda'
        coda += ch
      }
    } else {
      coda += ch
    }
  }

  if (onset) {
    result.push({
      phoneme: onset,
      ipa: `/${onset}/`,
      type: onset.length > 1 ? 'cluster' : 'consonant',
    })
  }

  if (vowel) {
    result.push({
      phoneme: vowel,
      ipa: `/${vowel}/`,
      type: 'vowel',
    })
  }

  if (coda) {
    result.push({
      phoneme: coda,
      ipa: `/${coda}/`,
      type: coda.length > 1 ? 'cluster' : 'consonant',
      isEnding: true,
    })
  }

  return result
}

/**
 * Evaluates student spoken pronunciation with granular phoneme breakdown
 * and Vietnamese ESL error pattern detection.
 */
export function evaluatePhonemePronunciation(
  targetWord: string,
  spokenText: string
): PhonemeAssessmentResult {
  const cleanedTarget = cleanText(targetWord)
  const cleanedSpoken = cleanText(spokenText)

  const segments = decomposeWordIntoPhonemes(cleanedTarget)

  if (!cleanedSpoken || segments.length === 0) {
    return {
      targetWord,
      transcribedText: spokenText,
      accuracy: 0,
      stars: 1,
      isPassed: false,
      hasDroppedFinalSound: false,
      phonemes: segments.map((s) => ({
        phoneme: s.phoneme,
        ipa: s.ipa,
        type: s.type,
        status: 'incorrect' as PhonemeStatus,
        score: 0,
        tipVi: `Hãy thử phát âm âm ${s.ipa}.`,
      })),
      overallFeedbackVi: 'Chưa nghe thấy giọng của em. Em hãy nói to và rõ ràng nhé!',
      remediationAdviceVi: 'Bấm nút micro và nói lại từ mẫu.',
    }
  }

  // Exact Match Check
  if (cleanedTarget === cleanedSpoken) {
    return {
      targetWord,
      transcribedText: spokenText,
      accuracy: 100,
      stars: 3,
      isPassed: true,
      hasDroppedFinalSound: false,
      phonemes: segments.map((s) => ({
        phoneme: s.phoneme,
        ipa: s.ipa,
        type: s.type,
        status: 'perfect' as PhonemeStatus,
        score: 100,
        tipVi: `Phát âm rất chuẩn âm ${s.ipa}!`,
      })),
      overallFeedbackVi: 'Xuất sắc! Em phát âm rất chuẩn xác và rõ ràng từng âm tiết.',
      remediationAdviceVi: 'Duy trì phát âm chuẩn xác này nhé!',
    }
  }

  // Vietnamese ESL Pattern Matchers
  let hasDroppedFinalSound = false
  const breakdowns: PhonemeBreakdown[] = []

  const lastSegment = segments[segments.length - 1]
  const firstSegment = segments[0]

  // 1. Detect Dropped Final Consonant (e.g. "lai" for "like", "ca" for "cat")
  const endingConsonants = ['k', 't', 'd', 's', 'z', 'p', 'sh', 'nk', 'mp']
  const targetEndingIsConsonant =
    lastSegment &&
    (lastSegment.isEnding || endingConsonants.some((ec) => lastSegment.phoneme.includes(ec)))

  if (targetEndingIsConsonant) {
    // Check if spoken ends with vowel while target ends with consonant
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y']
    const spokenEndsWithVowel = vowels.some((v) => cleanedSpoken.endsWith(v))
    const spokenLacksEnding =
      !cleanedSpoken.endsWith(lastSegment.phoneme) &&
      !cleanedSpoken.endsWith(lastSegment.phoneme.slice(-1))

    if (spokenEndsWithVowel || spokenLacksEnding) {
      hasDroppedFinalSound = true
    }
  }

  // 2. Detect Dental Fricative Substitution (/θ/ -> s/t, /ð/ -> d/z)
  const hasDentalFricativeVoiceless = firstSegment?.ipa === '/θ/' // think
  const substitutedVoicelessWithS =
    hasDentalFricativeVoiceless && (cleanedSpoken.startsWith('s') || cleanedSpoken.startsWith('t'))

  const hasDentalFricativeVoiced = firstSegment?.ipa === '/ð/' // this, that
  const substitutedVoicedWithD =
    hasDentalFricativeVoiced && (cleanedSpoken.startsWith('d') || cleanedSpoken.startsWith('z'))

  // 3. Detect S/SH Confusion (/ʃ/ -> s)
  const hasShOnset = firstSegment?.ipa === '/ʃ/' || firstSegment?.phoneme === 'sh'
  const substitutedShWithS = hasShOnset && cleanedSpoken.startsWith('s')

  // Evaluate each phoneme segment
  segments.forEach((seg, idx) => {
    const isFirst = idx === 0
    const isLast = idx === segments.length - 1

    if (isLast && hasDroppedFinalSound) {
      breakdowns.push({
        phoneme: seg.phoneme,
        ipa: seg.ipa,
        type: seg.type,
        status: 'omitted',
        score: 0,
        tipVi: `Lỗi nuốt âm đuôi: Hãy nhớ bật âm đuôi ${seg.ipa} ở cuối từ '${targetWord}'.`,
      })
    } else if (isFirst && (substitutedVoicelessWithS || substitutedVoicedWithD)) {
      breakdowns.push({
        phoneme: seg.phoneme,
        ipa: seg.ipa,
        type: seg.type,
        status: 'near',
        score: 70,
        tipVi: substitutedVoicelessWithS
          ? 'Chú ý đặt đầu lưỡi giữa hai hàm răng và thổi hơi nhẹ cho âm /θ/.'
          : 'Đặt đầu lưỡi giữa hai hàm răng và rung dây thanh quản cho âm /ð/.',
      })
    } else if (isFirst && substitutedShWithS) {
      breakdowns.push({
        phoneme: seg.phoneme,
        ipa: seg.ipa,
        type: seg.type,
        status: 'near',
        score: 70,
        tipVi: 'Tròn môi và cong lưỡi hơn khi phát âm /ʃ/.',
      })
    } else {
      // General similarity based on characters
      const charMatches = cleanedSpoken.includes(seg.phoneme.slice(0, 1))
      breakdowns.push({
        phoneme: seg.phoneme,
        ipa: seg.ipa,
        type: seg.type,
        status: charMatches ? 'perfect' : 'near',
        score: charMatches ? 95 : 65,
        tipVi: charMatches
          ? `Phát âm tốt âm ${seg.ipa}.`
          : `Luyện tập thêm âm ${seg.ipa}.`,
      })
    }
  })

  // Calculate overall accuracy
  const totalScore = breakdowns.reduce((acc, b) => acc + b.score, 0)
  const accuracy = Math.round(totalScore / breakdowns.length)
  const isPassed = accuracy >= 70 && !hasDroppedFinalSound

  let stars: 1 | 2 | 3 = 1
  if (accuracy >= 85 && !hasDroppedFinalSound) {
    stars = 3
  } else if (accuracy >= 70) {
    stars = 2
  }

  let overallFeedbackVi = 'Cần chú ý thêm một số âm để phát âm tự nhiên hơn nhé.'
  let remediationAdviceVi = 'Nghe lại phát âm mẫu và tập luyện từng âm tiết.'

  if (hasDroppedFinalSound) {
    overallFeedbackVi = `Em phát âm tốt phần đầu nhưng bị thiếu âm đuôi ${lastSegment.ipa}.`
    remediationAdviceVi = `Hãy nhấn rõ âm đuôi ${lastSegment.ipa} ở cuối từ '${targetWord}'.`
  } else if (stars === 3) {
    overallFeedbackVi = 'Phát âm rất tốt và rõ ràng!'
  }

  return {
    targetWord,
    transcribedText: spokenText,
    accuracy,
    stars,
    isPassed,
    hasDroppedFinalSound,
    phonemes: breakdowns,
    overallFeedbackVi,
    remediationAdviceVi,
  }
}
