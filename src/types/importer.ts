import type { CefrLevel, PartOfSpeech } from './word-bank';

export type ImportRowStatus = 'valid' | 'warning' | 'duplicate' | 'error';

export const IMPORT_ROW_STATUSES: readonly ImportRowStatus[] = [
  'valid',
  'warning',
  'duplicate',
  'error',
] as const;

export interface RawImportRow {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  partOfSpeech?: string;
  cefrLevel?: string;
  topic?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface ValidatedImportRow {
  id: string;
  english: string;
  vietnamese: string;
  phonetic: string | null;
  partOfSpeech: PartOfSpeech;
  cefrLevel: CefrLevel;
  topic: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  status: ImportRowStatus;
  validationMessage?: string;
  isSelected: boolean;
}

export interface ImportValidationSummary {
  total: number;
  validCount: number;
  warningCount: number;
  duplicateCount: number;
  errorCount: number;
}

export interface ImportParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  defaultCefrLevel?: CefrLevel;
  defaultTopic?: string;
  defaultPartOfSpeech?: PartOfSpeech;
}
