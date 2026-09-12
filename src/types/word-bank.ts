export type CefrLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';

export const CEFR_LEVELS: readonly CefrLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2'] as const;
export const PARTS_OF_SPEECH: readonly PartOfSpeech[] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'phrase',
] as const;

export interface WordBankItem {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string | null;
  partOfSpeech: PartOfSpeech;
  cefrLevel: CefrLevel;
  topic: string;
  emoji?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  distractors: string[];
  createdBy?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordBankFilterInput {
  search?: string;
  topic?: string;
  cefrLevel?: CefrLevel | 'all';
  partOfSpeech?: PartOfSpeech | 'all';
  page?: number;
  pageSize?: number;
}

export interface CreateWordBankInput {
  english: string;
  vietnamese: string;
  phonetic?: string | null;
  partOfSpeech?: PartOfSpeech;
  cefrLevel?: CefrLevel;
  topic?: string;
  emoji?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  distractors?: string[];
  createdBy?: string | null;
  isSystem?: boolean;
}

export interface UpdateWordBankInput {
  id: string;
  english?: string;
  vietnamese?: string;
  phonetic?: string | null;
  partOfSpeech?: PartOfSpeech;
  cefrLevel?: CefrLevel;
  topic?: string;
  emoji?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  distractors?: string[];
  isSystem?: boolean;
}
