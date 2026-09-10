import { WordConnectLevel } from "@/types/word-connect";
import rawLevels from "./levels.json";

export const WORD_CONNECT_LEVELS: WordConnectLevel[] = rawLevels as WordConnectLevel[];

/**
 * Returns a level by its 0-based array index.
 * @param index 0-based index of the level
 * @returns WordConnectLevel or undefined if index is out of bounds
 */
export function getLevelByIndex(index: number): WordConnectLevel | undefined {
  if (index < 0 || index >= WORD_CONNECT_LEVELS.length) {
    return undefined;
  }
  return WORD_CONNECT_LEVELS[index];
}

/**
 * Returns a level matching the specified unique ID.
 * @param id Unique level identifier, e.g. "level-1"
 * @returns WordConnectLevel or undefined if not found
 */
export function getLevelById(id: string): WordConnectLevel | undefined {
  return WORD_CONNECT_LEVELS.find((level) => level.id === id);
}

/**
 * Returns the total number of curated curriculum levels available.
 */
export function getTotalLevels(): number {
  return WORD_CONNECT_LEVELS.length;
}
