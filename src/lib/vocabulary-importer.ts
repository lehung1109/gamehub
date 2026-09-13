import type {
  RawImportRow,
  ValidatedImportRow,
  ImportValidationSummary,
  ImportParseOptions,
  ImportRowStatus,
} from '@/types/importer';
import type { CefrLevel, PartOfSpeech, CreateWordBankInput } from '@/types/word-bank';

/**
 * Generates a unique row identifier
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'row_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Strips leading numbers, dots, brackets, colons, or dashes representing list numbering.
 * Examples:
 *   "1. apple" -> "apple"
 *   "10) book" -> "book"
 *   "[3] cat"  -> "cat"
 *   "(4) dog"  -> "dog"
 *   "5: fox"   -> "fox"
 *   "3D printer" -> "3D printer" (preserved)
 */
export function cleanRowNumbering(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  return trimmed
    .replace(/^(?:\[\d+\]|\(\d+\)|\d+(?:[\.\)\:\-–—]|\s*[-–—]))\s*/, '')
    .trim();
}

/**
 * Autodetects the delimiter used in a sample line.
 * Delimiters supported: '\t', ',', ';', '-', ':', '|'.
 */
export function detectDelimiter(sampleLine: string): string {
  if (!sampleLine) return '\t';
  const cleaned = cleanRowNumbering(sampleLine);
  if (cleaned.includes('\t')) return '\t';
  if (cleaned.includes('|')) return '|';
  if (cleaned.includes(';')) return ';';
  if (cleaned.includes(',')) return ',';
  if (cleaned.includes(' - ')) return '-';
  if (cleaned.includes(' : ')) return ':';
  if (cleaned.includes(':')) return ':';
  if (cleaned.includes('-')) return '-';
  return '\t';
}

/**
 * Normalizes CEFR level strings to official enum values.
 */
export function normalizeCefrLevel(
  value?: string,
  fallback?: CefrLevel
): CefrLevel | null {
  if (!value || typeof value !== 'string') {
    return fallback ?? null;
  }
  const clean = value.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (clean === 'a1') return 'A1';
  if (clean === 'a2') return 'A2';
  if (clean === 'b1') return 'B1';
  if (clean === 'b2') return 'B2';
  if (clean === 'prea1') return 'Pre-A1';
  return fallback ?? null;
}

/**
 * Normalizes Part of Speech strings and common abbreviations.
 */
export function normalizePartOfSpeech(
  value?: string,
  fallback?: PartOfSpeech
): PartOfSpeech | null {
  if (!value || typeof value !== 'string') {
    return fallback ?? null;
  }
  const clean = value.trim().toLowerCase().replace(/\.$/, '');
  if (['noun', 'n', 'danh từ', 'danh tu'].includes(clean)) return 'noun';
  if (['verb', 'v', 'động từ', 'dong tu'].includes(clean)) return 'verb';
  if (['adjective', 'adj', 'a', 'tính từ', 'tinh tu'].includes(clean)) return 'adjective';
  if (['adverb', 'adv', 'phó từ', 'trạng từ', 'trang tu'].includes(clean)) return 'adverb';
  if (['phrase', 'phr', 'idiom', 'cụm từ', 'cum tu'].includes(clean)) return 'phrase';
  return fallback ?? null;
}

/**
 * Parses line-by-line flashcard text (such as Quizlet exports).
 * - Delimiters supported: Tab, comma, dash, colon, or pipe.
 * - Left part = English, Right part = Vietnamese definition.
 * - Ignores empty lines and comments (# or //).
 */
export function parseQuizletText(raw: string, customDelimiter?: string): RawImportRow[] {
  if (!raw || typeof raw !== 'string') return [];
  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));

  if (lines.length === 0) return [];

  const delim = customDelimiter || detectDelimiter(lines[0]);

  return lines.map(line => {
    let left = '';
    let right = '';

    if (delim === '-' && line.includes(' - ')) {
      const idx = line.indexOf(' - ');
      left = line.substring(0, idx);
      right = line.substring(idx + 3);
    } else if (delim === ':' && line.includes(' : ')) {
      const idx = line.indexOf(' : ');
      left = line.substring(0, idx);
      right = line.substring(idx + 3);
    } else {
      const idx = line.indexOf(delim);
      if (idx !== -1) {
        left = line.substring(0, idx);
        right = line.substring(idx + delim.length);
      } else {
        left = line;
        right = '';
      }
    }

    const english = cleanRowNumbering(left.replace(/^["']|["']$/g, '').trim());
    const vietnamese = right.replace(/^["']|["']$/g, '').trim();

    return {
      id: generateId(),
      english,
      vietnamese,
    };
  });
}

type FieldKey = keyof Omit<RawImportRow, 'id'>;

const HEADER_MAP: Record<string, FieldKey> = {
  english: 'english',
  'tiếng anh': 'english',
  'tieng anh': 'english',
  term: 'english',
  word: 'english',
  từ: 'english',

  vietnamese: 'vietnamese',
  'tiếng việt': 'vietnamese',
  'tieng viet': 'vietnamese',
  nghĩa: 'vietnamese',
  nghia: 'vietnamese',
  definition: 'vietnamese',
  dịch: 'vietnamese',
  dich: 'vietnamese',
  meaning: 'vietnamese',

  phonetic: 'phonetic',
  'phiên âm': 'phonetic',
  'phien am': 'phonetic',
  pronunciation: 'phonetic',
  ipa: 'phonetic',

  'part of speech': 'partOfSpeech',
  'part_of_speech': 'partOfSpeech',
  pos: 'partOfSpeech',
  'từ loại': 'partOfSpeech',
  'tu loai': 'partOfSpeech',
  'loại từ': 'partOfSpeech',
  'loai tu': 'partOfSpeech',

  cefr: 'cefrLevel',
  'cefr level': 'cefrLevel',
  'cefr_level': 'cefrLevel',
  'cấp độ': 'cefrLevel',
  'cap do': 'cefrLevel',
  level: 'cefrLevel',
  'trình độ': 'cefrLevel',
  'trinh do': 'cefrLevel',

  topic: 'topic',
  'chủ đề': 'topic',
  'chu de': 'topic',
  category: 'topic',
  'chủ điểm': 'topic',
  'chu diem': 'topic',

  example: 'exampleSentence',
  'ví dụ': 'exampleSentence',
  'vi du': 'exampleSentence',
  'example sentence': 'exampleSentence',
  'example_sentence': 'exampleSentence',
  'câu ví dụ': 'exampleSentence',
  'cau vi du': 'exampleSentence',

  'example translation': 'exampleTranslation',
  'example_translation': 'exampleTranslation',
  'dịch ví dụ': 'exampleTranslation',
  'dich vi du': 'exampleTranslation',
  'nghĩa ví dụ': 'exampleTranslation',
  'nghia vi du': 'exampleTranslation',
  'vietnamese example': 'exampleTranslation',
  'câu dịch': 'exampleTranslation',
};

function isKnownPartOfSpeech(val: string): boolean {
  return normalizePartOfSpeech(val) !== null;
}

function isPhonetic(val: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return (
    (trimmed.startsWith('/') && trimmed.endsWith('/')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  );
}

function parseDelimitedGrid(raw: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const nextChar = raw[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses CSV or TSV raw text with RFC 4180 quote support.
 * Automatically recognizes headers or falls back to positional defaults.
 */
export function parseCsvOrTsv(raw: string): RawImportRow[] {
  if (!raw || typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];

  const firstLine = raw.split(/\r?\n/)[0] || '';
  const delimiter = firstLine.includes('\t')
    ? '\t'
    : firstLine.includes(';') && !firstLine.includes(',')
      ? ';'
      : ',';

  const grid = parseDelimitedGrid(raw, delimiter);
  if (grid.length === 0) return [];

  const headerRow = grid[0];
  const colMap = new Map<number, FieldKey>();
  let hasHeader = false;

  for (let c = 0; c < headerRow.length; c++) {
    const rawCell = headerRow[c] || '';
    const norm = rawCell.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
    const fieldKey = HEADER_MAP[norm] || HEADER_MAP[rawCell.toLowerCase().trim()];
    if (fieldKey) {
      colMap.set(c, fieldKey);
      hasHeader = true;
    }
  }

  if (hasHeader) {
    const dataRows = grid.slice(1);
    return dataRows.map(row => {
      const rawRow: RawImportRow = {
        id: generateId(),
        english: '',
        vietnamese: '',
      };
      for (const [colIdx, fieldKey] of colMap.entries()) {
        const val = (row[colIdx] || '').trim();
        if (fieldKey === 'english') {
          rawRow.english = cleanRowNumbering(val);
        } else if (fieldKey === 'vietnamese') {
          rawRow.vietnamese = val;
        } else if (val.length > 0) {
          rawRow[fieldKey] = val;
        }
      }
      return rawRow;
    });
  }

  // Positional fallback without headers:
  // Col 0: English, Col 1: Vietnamese, Col 2+: POS or Phonetic, CEFR, Topic...
  return grid.map(row => {
    const col0 = row[0] || '';
    const col1 = row[1] || '';
    const col2 = row[2] || '';
    const col3 = row[3] || '';

    const rawRow: RawImportRow = {
      id: generateId(),
      english: cleanRowNumbering(col0.trim()),
      vietnamese: col1.trim(),
    };

    if (col2) {
      if (isKnownPartOfSpeech(col2)) {
        rawRow.partOfSpeech = col2.trim();
        if (col3) {
          if (normalizeCefrLevel(col3)) {
            rawRow.cefrLevel = col3.trim();
            if (row[4]) rawRow.topic = row[4].trim();
            if (row[5]) rawRow.exampleSentence = row[5].trim();
            if (row[6]) rawRow.exampleTranslation = row[6].trim();
          } else {
            rawRow.topic = col3.trim();
            if (row[4]) rawRow.exampleSentence = row[4].trim();
            if (row[5]) rawRow.exampleTranslation = row[5].trim();
          }
        }
      } else if (isPhonetic(col2)) {
        rawRow.phonetic = col2.trim();
        if (col3) {
          if (isKnownPartOfSpeech(col3)) {
            rawRow.partOfSpeech = col3.trim();
            if (row[4] && normalizeCefrLevel(row[4])) rawRow.cefrLevel = row[4].trim();
            if (row[5]) rawRow.topic = row[5].trim();
            if (row[6]) rawRow.exampleSentence = row[6].trim();
            if (row[7]) rawRow.exampleTranslation = row[7].trim();
          }
        }
      } else {
        rawRow.phonetic = col2.trim();
        if (col3 && isKnownPartOfSpeech(col3)) {
          rawRow.partOfSpeech = col3.trim();
        }
      }
    }

    return rawRow;
  });
}

/**
 * Validates raw rows, performs deduplication, applies default fallbacks,
 * and produces a structured validation summary.
 */
export function validateImportRows(
  rows: RawImportRow[],
  options?: ImportParseOptions,
  existingWords?: Set<string>
): { rows: ValidatedImportRow[]; summary: ImportValidationSummary } {
  const defaultCefrLevel: CefrLevel = options?.defaultCefrLevel || 'A1';
  const defaultPartOfSpeech: PartOfSpeech = options?.defaultPartOfSpeech || 'noun';
  const defaultTopic = options?.defaultTopic || 'general';

  const existingSet = new Set(
    existingWords
      ? Array.from(existingWords).map(w => w.toLowerCase().trim())
      : []
  );
  const seenInBatch = new Set<string>();

  const validatedRows: ValidatedImportRow[] = rows.map(rawRow => {
    const rawEnglish = (rawRow.english || '').trim();
    const rawVietnamese = (rawRow.vietnamese || '').trim();
    const english = cleanRowNumbering(rawEnglish);
    const vietnamese = rawVietnamese;
    const lowerWord = english.toLowerCase();

    // CEFR
    let cefrLevel: CefrLevel = defaultCefrLevel;
    let cefrValid = true;
    if (rawRow.cefrLevel && rawRow.cefrLevel.trim().length > 0) {
      const norm = normalizeCefrLevel(rawRow.cefrLevel);
      if (norm) {
        cefrLevel = norm;
      } else {
        cefrValid = false;
        cefrLevel = defaultCefrLevel;
      }
    }

    // Part of Speech
    let partOfSpeech: PartOfSpeech = defaultPartOfSpeech;
    let posValid = true;
    if (rawRow.partOfSpeech && rawRow.partOfSpeech.trim().length > 0) {
      const norm = normalizePartOfSpeech(rawRow.partOfSpeech);
      if (norm) {
        partOfSpeech = norm;
      } else {
        posValid = false;
        partOfSpeech = defaultPartOfSpeech;
      }
    }

    // Topic
    const topic = (rawRow.topic && rawRow.topic.trim().length > 0)
      ? rawRow.topic.trim()
      : defaultTopic;

    // Phonetic & Examples
    const phonetic = (rawRow.phonetic && rawRow.phonetic.trim().length > 0)
      ? rawRow.phonetic.trim()
      : null;
    const exampleSentence = (rawRow.exampleSentence && rawRow.exampleSentence.trim().length > 0)
      ? rawRow.exampleSentence.trim()
      : null;
    const exampleTranslation = (rawRow.exampleTranslation && rawRow.exampleTranslation.trim().length > 0)
      ? rawRow.exampleTranslation.trim()
      : null;

    let status: ImportRowStatus = 'valid';
    let validationMessage: string | undefined;
    let isSelected = true;

    if (!english || !vietnamese) {
      status = 'error';
      isSelected = false;
      if (!english && !vietnamese) {
        validationMessage = 'Missing English word and Vietnamese definition';
      } else if (!english) {
        validationMessage = 'Missing English word';
      } else {
        validationMessage = 'Missing Vietnamese definition';
      }
    } else if (seenInBatch.has(lowerWord)) {
      status = 'duplicate';
      isSelected = false;
      validationMessage = `Duplicate word "${english}" in this import batch`;
    } else if (existingSet.has(lowerWord)) {
      status = 'warning';
      isSelected = false;
      validationMessage = `Word "${english}" already exists in word bank`;
      seenInBatch.add(lowerWord);
    } else if (!cefrValid || !posValid) {
      status = 'warning';
      isSelected = true;
      const reasons: string[] = [];
      if (!cefrValid) {
        reasons.push(`invalid CEFR level "${rawRow.cefrLevel}" (defaulted to ${defaultCefrLevel})`);
      }
      if (!posValid) {
        reasons.push(`invalid part of speech "${rawRow.partOfSpeech}" (defaulted to ${defaultPartOfSpeech})`);
      }
      validationMessage = `Defaulted due to ${reasons.join(' and ')}`;
      seenInBatch.add(lowerWord);
    } else {
      status = 'valid';
      isSelected = true;
      seenInBatch.add(lowerWord);
    }

    return {
      id: rawRow.id || generateId(),
      english,
      vietnamese,
      phonetic,
      partOfSpeech,
      cefrLevel,
      topic,
      exampleSentence,
      exampleTranslation,
      status,
      validationMessage,
      isSelected,
    };
  });

  const summary: ImportValidationSummary = {
    total: validatedRows.length,
    validCount: validatedRows.filter(r => r.status === 'valid').length,
    warningCount: validatedRows.filter(r => r.status === 'warning').length,
    duplicateCount: validatedRows.filter(r => r.status === 'duplicate').length,
    errorCount: validatedRows.filter(r => r.status === 'error').length,
  };

  return { rows: validatedRows, summary };
}

/**
 * Transforms validated and selected rows into CreateWordBankInput items
 * ready for batch insertion into the word bank.
 */
export function formatRowsForWordBank(rows: ValidatedImportRow[]): CreateWordBankInput[] {
  return rows
    .filter(row => row.isSelected && row.status !== 'error')
    .map(row => ({
      english: row.english,
      vietnamese: row.vietnamese,
      phonetic: row.phonetic || null,
      partOfSpeech: row.partOfSpeech,
      cefrLevel: row.cefrLevel,
      topic: row.topic,
      exampleSentence: row.exampleSentence || null,
      exampleTranslation: row.exampleTranslation || null,
      distractors: [],
    }));
}
