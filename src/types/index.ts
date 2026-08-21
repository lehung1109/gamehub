// src/types/index.ts

export interface Game {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  description: string;
  emoji: string;
  route: string;
  priority: number;
}

export interface Topic {
  id: string;
  nameEn: string;
  nameVi: string;
  emoji: string;
}

export interface Word {
  id: string;
  english: string;
  phonetic: string;
  vietnamese: string;
  emoji: string;
  topicId: string;
}

export interface Letter {
  letter: string;
  phonetic: string;
  exampleWord: string;
  exampleEmoji: string;
}

export interface GameNumber {
  value: number;
  english: string;
  vietnamese: string;
  emoji: string;
}

export interface Color {
  id: string;
  english: string;
  vietnamese: string;
  hex: string;
  tailwindClass: string;
}

export interface Sentence {
  id: string;
  words: string[];
  full: string;
  vietnamese: string;
  emoji: string;
  category: string;
}
