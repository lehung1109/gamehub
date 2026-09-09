import { HangmanWord } from "@/types/hangman";
import animals from "@/data/words/animals.json";
import fruits from "@/data/words/fruits.json";
import school from "@/data/words/school.json";
import family from "@/data/words/family.json";
import bodyParts from "@/data/words/body-parts.json";

interface RawVocab {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  emoji?: string;
}

const TOPIC_MAP: Record<string, RawVocab[]> = {
  animals: animals as RawVocab[],
  fruits: fruits as RawVocab[],
  school: school as RawVocab[],
  family: family as RawVocab[],
  "body-parts": bodyParts as RawVocab[],
};

export function loadRoundWords(
  topicId: string,
  count: number = 5,
  rng: () => number = Math.random
): HangmanWord[] {
  const rawList = TOPIC_MAP[topicId] || TOPIC_MAP.animals;
  const filtered = rawList.filter((item) => /^[a-zA-Z]+$/.test(item.english.trim()));
  const shuffled = [...filtered].sort(() => rng() - 0.5);

  const selected = shuffled.slice(0, count);
  return selected.map((item) => ({
    id: item.id,
    word: item.english.trim().toUpperCase(),
    clue: item.vietnamese,
    phonetic: item.phonetic,
    emoji: item.emoji,
  }));
}

export function calculateWordScore(mistakes: number, hintUsed: boolean): number {
  if (mistakes >= 6) return 0;
  const remainingBalloons = 6 - mistakes;
  const base = 200;
  const mistakePenalty = mistakes * 20;
  const balloonBonus = remainingBalloons * 30;
  const hintPenalty = hintUsed ? 100 : 0;

  const total = base - mistakePenalty + balloonBonus - hintPenalty;
  return Math.max(50, total);
}

export function calculateRoundStars(
  totalScore: number,
  solvedCount: number,
  totalWords: number = 5
): number {
  if (totalScore >= 1200 && solvedCount === totalWords) return 3;
  if (totalScore >= 700 && solvedCount >= 3) return 2;
  if (totalScore > 0) return 1;
  return 0;
}
