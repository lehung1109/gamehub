import { FallingWord, SpecialPowerType, VocabularyItem } from "@/types/falling-words";
import animals from "@/data/words/animals.json";
import fruits from "@/data/words/fruits.json";
import school from "@/data/words/school.json";
import family from "@/data/words/family.json";
import bodyParts from "@/data/words/body-parts.json";

const TOPIC_MAP: Record<string, VocabularyItem[]> = {
  animals: animals as VocabularyItem[],
  fruits: fruits as VocabularyItem[],
  school: school as VocabularyItem[],
  family: family as VocabularyItem[],
  "body-parts": bodyParts as VocabularyItem[],
};

export function getWordsForTopic(topicId: string): VocabularyItem[] {
  return TOPIC_MAP[topicId] || TOPIC_MAP.animals;
}

export function createFallingWord(
  vocab: VocabularyItem,
  lane: number,
  baseSpeed: number,
  rng: () => number = Math.random
): FallingWord {
  const cleanWord = vocab.english.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const isSpecial = rng() <= 0.2;
  let specialType: SpecialPowerType | undefined = undefined;

  if (isSpecial) {
    const roll = rng();
    if (roll < 0.45) {
      specialType = "double_score";
    } else if (roll < 0.75) {
      specialType = "slow_freeze";
    } else {
      specialType = "heal_life";
    }
  }

  return {
    id: `${vocab.id || cleanWord}-${Date.now()}-${Math.floor(rng() * 1000)}`,
    word: cleanWord,
    clue: vocab.vietnamese,
    phonetic: vocab.phonetic,
    emoji: vocab.emoji,
    lane,
    y: 0,
    speed: Math.max(8, baseSpeed),
    typedIndex: 0,
    isTargeted: false,
    specialType,
  };
}

export function selectAvailableLane(
  activeLanes: number[],
  rng: () => number = Math.random
): number {
  const allLanes = [0, 1, 2, 3];
  const laneCounts = [0, 0, 0, 0];
  for (const lane of activeLanes) {
    if (lane >= 0 && lane < 4) {
      laneCounts[lane]++;
    }
  }

  const minCount = Math.min(...laneCounts);
  const candidateLanes = allLanes.filter((l) => laneCounts[l] === minCount);

  const chosenIndex = Math.floor(rng() * candidateLanes.length);
  return candidateLanes[chosenIndex];
}
