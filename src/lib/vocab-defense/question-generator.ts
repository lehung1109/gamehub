import { ChallengeQuestion, SkillType } from "@/types/vocab-defense";
import animalsData from "@/data/words/animals.json";
import fruitsData from "@/data/words/fruits.json";
import schoolData from "@/data/words/school.json";
import sentencesData from "@/data/sentences.json";

interface WordItem {
  id: string;
  english: string;
  phonetic: string;
  vietnamese: string;
  emoji: string;
  topicId: string;
}

const ALL_WORDS: WordItem[] = [
  ...(animalsData as WordItem[]),
  ...(fruitsData as WordItem[]),
  ...(schoolData as WordItem[]),
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateChallenge(skill: SkillType, usedWordIds: string[] = []): ChallengeQuestion {
  if (skill === "ULTIMATE") {
    const availableSentences = sentencesData.filter((s) => !usedWordIds.includes(s.id));
    const target = availableSentences.length > 0 ? shuffle(availableSentences)[0] : shuffle(sentencesData)[0];
    
    // Create distractors by swapping 2 words
    const words = [...target.words];
    const scrambled = shuffle([...words]).join(" ");
    const swapped = words.length > 2 
      ? [words[1], words[0], ...words.slice(2)].join(" ")
      : scrambled;
    const missingOne = words.slice(0, words.length - 1).join(" ");

    const optionsPool = [target.full, scrambled, swapped, missingOne];
    const uniqueOptions = Array.from(new Set(optionsPool)).slice(0, 4);
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`${target.full} (Variation)`);
    }

    const shuffledOptions = shuffle(uniqueOptions);
    const correctIndex = shuffledOptions.indexOf(target.full);

    return {
      id: target.id,
      type: "ULTIMATE",
      prompt: `Ghép câu hoàn chỉnh cho nghĩa: "${target.vietnamese}"`,
      targetWord: target.full,
      options: shuffledOptions,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: `Câu đúng: "${target.full}" (${target.vietnamese})`,
      emoji: target.emoji || "⚡",
    };
  }

  // ATTACK or SHIELD
  const availableWords = ALL_WORDS.filter((w) => !usedWordIds.includes(w.id));
  const pool = availableWords.length >= 4 ? availableWords : ALL_WORDS;
  const target = shuffle(pool)[0];

  const distractors = shuffle(ALL_WORDS.filter((w) => w.id !== target.id)).slice(0, 3);

  if (skill === "SHIELD") {
    // Audio / Listening quiz: Options are English words
    const optionItems = shuffle([target, ...distractors]);
    const options = optionItems.map((item) => item.english);
    const correctIndex = options.indexOf(target.english);

    return {
      id: target.id,
      type: "SHIELD",
      prompt: "Nghe phát âm và chọn từ vựng tương ứng:",
      targetWord: target.english,
      options,
      correctIndex,
      explanation: `"${target.english}" ${target.phonetic} có nghĩa là: ${target.vietnamese}`,
      phonetic: target.phonetic,
      emoji: target.emoji,
    };
  }

  // Default: ATTACK (English to Vietnamese meaning)
  const optionItems = shuffle([target, ...distractors]);
  const options = optionItems.map((item) => item.vietnamese);
  const correctIndex = options.indexOf(target.vietnamese);

  return {
    id: target.id,
    type: "ATTACK",
    prompt: `Từ "${target.english}" có nghĩa là gì?`,
    targetWord: target.english,
    options,
    correctIndex,
    explanation: `"${target.english}" ${target.phonetic} có nghĩa là: ${target.vietnamese}`,
    phonetic: target.phonetic,
    emoji: target.emoji,
  };
}
