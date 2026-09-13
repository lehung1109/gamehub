import { describe, it, expect } from 'vitest';
import {
  cleanRowNumbering,
  detectDelimiter,
  parseQuizletText,
  parseCsvOrTsv,
  validateImportRows,
  formatRowsForWordBank,
  normalizeCefrLevel,
  normalizePartOfSpeech,
} from '@/lib/vocabulary-importer';
import type { RawImportRow, ValidatedImportRow, ImportParseOptions } from '@/types/importer';

describe('cleanRowNumbering', () => {
  it('strips leading numbers with dots', () => {
    expect(cleanRowNumbering('1. apple')).toBe('apple');
    expect(cleanRowNumbering('10. book')).toBe('book');
    expect(cleanRowNumbering('100. notebook')).toBe('notebook');
  });

  it('strips leading numbers with parentheses or brackets', () => {
    expect(cleanRowNumbering('2) banana')).toBe('banana');
    expect(cleanRowNumbering('10) pencil')).toBe('pencil');
    expect(cleanRowNumbering('[3] cat')).toBe('cat');
    expect(cleanRowNumbering('(4) dog')).toBe('dog');
  });

  it('strips leading numbers with colons or dashes', () => {
    expect(cleanRowNumbering('5: elephant')).toBe('elephant');
    expect(cleanRowNumbering('6 - fox')).toBe('fox');
    expect(cleanRowNumbering('7 – wolf')).toBe('wolf');
  });

  it('handles multiple leading spaces and trailing spaces', () => {
    expect(cleanRowNumbering('   8.    grape   ')).toBe('grape');
  });

  it('preserves text with legitimate numbers that are not row indices', () => {
    expect(cleanRowNumbering('3D printer')).toBe('3D printer');
    expect(cleanRowNumbering('24/7 service')).toBe('24/7 service');
    expect(cleanRowNumbering('100 years of solitude')).toBe('100 years of solitude');
  });

  it('preserves already clean text and handles empty strings', () => {
    expect(cleanRowNumbering('hello world')).toBe('hello world');
    expect(cleanRowNumbering('')).toBe('');
    expect(cleanRowNumbering('   ')).toBe('');
  });
});

describe('detectDelimiter', () => {
  it('detects tab delimiter', () => {
    expect(detectDelimiter('apple\tquả táo')).toBe('\t');
  });

  it('detects comma delimiter', () => {
    expect(detectDelimiter('apple,quả táo')).toBe(',');
    expect(detectDelimiter('apple, quả táo')).toBe(',');
  });

  it('detects semicolon delimiter', () => {
    expect(detectDelimiter('apple;quả táo')).toBe(';');
    expect(detectDelimiter('apple; quả táo')).toBe(';');
  });

  it('detects pipe delimiter', () => {
    expect(detectDelimiter('apple|quả táo')).toBe('|');
    expect(detectDelimiter('apple | quả táo')).toBe('|');
  });

  it('detects dash separator', () => {
    expect(detectDelimiter('apple - quả táo')).toBe('-');
  });

  it('detects colon separator', () => {
    expect(detectDelimiter('apple : quả táo')).toBe(':');
  });

  it('ignores row numbering when detecting delimiter', () => {
    expect(detectDelimiter('1. apple - quả táo')).toBe('-');
    expect(detectDelimiter('2) banana : quả chuối')).toBe(':');
  });

  it('prefers comma over hyphen inside words', () => {
    expect(detectDelimiter('ice-cream, kem')).toBe(',');
    expect(detectDelimiter('well-known\tnổi tiếng')).toBe('\t');
  });

  it('falls back to tab on text without delimiters', () => {
    expect(detectDelimiter('hello')).toBe('\t');
  });
});

describe('parseQuizletText', () => {
  it('parses tab-separated lines', () => {
    const raw = `apple\tquả táo\nbanana\tquả chuối`;
    const rows = parseQuizletText(raw);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('apple');
    expect(rows[0].vietnamese).toBe('quả táo');
    expect(rows[1].english).toBe('banana');
    expect(rows[1].vietnamese).toBe('quả chuối');
  });

  it('parses hyphen-separated lines', () => {
    const raw = `cat - con mèo\ndog - con chó`;
    const rows = parseQuizletText(raw);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('cat');
    expect(rows[0].vietnamese).toBe('con mèo');
    expect(rows[1].english).toBe('dog');
    expect(rows[1].vietnamese).toBe('con chó');
  });

  it('parses colon and pipe separated lines', () => {
    const rawColon = `sun : mặt trời\nmoon : mặt trăng`;
    const rowsColon = parseQuizletText(rawColon);
    expect(rowsColon[0].english).toBe('sun');
    expect(rowsColon[0].vietnamese).toBe('mặt trời');

    const rawPipe = `water | nước\nfire | lửa`;
    const rowsPipe = parseQuizletText(rawPipe);
    expect(rowsPipe[0].english).toBe('water');
    expect(rowsPipe[0].vietnamese).toBe('nước');
  });

  it('respects custom delimiter argument', () => {
    const raw = `pen///cái bút\nruler///thước kẻ`;
    const rows = parseQuizletText(raw, '///');
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('pen');
    expect(rows[0].vietnamese).toBe('cái bút');
  });

  it('cleans row numbering on the term side', () => {
    const raw = `1. school\ttrường học\n2) teacher\tgiáo viên\n[3] student\thọc sinh`;
    const rows = parseQuizletText(raw);
    expect(rows).toHaveLength(3);
    expect(rows[0].english).toBe('school');
    expect(rows[1].english).toBe('teacher');
    expect(rows[2].english).toBe('student');
  });

  it('ignores blank lines and comments (# and //)', () => {
    const raw = `
      # Quizlet Set: Animals
      // Exported by teacher

      tiger\tcon hổ

      # Another comment
      lion\tsư tử
      // End of list
    `;
    const rows = parseQuizletText(raw);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('tiger');
    expect(rows[1].english).toBe('lion');
  });

  it('handles terms without definitions', () => {
    const raw = `orphan_word\napple\tquả táo`;
    const rows = parseQuizletText(raw);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('orphan_word');
    expect(rows[0].vietnamese).toBe('');
    expect(rows[1].english).toBe('apple');
  });

  it('returns empty array on empty input', () => {
    expect(parseQuizletText('')).toEqual([]);
    expect(parseQuizletText('   \n  \n')).toEqual([]);
  });

  it('generates unique IDs for each row', () => {
    const raw = `one\tmột\ntwo\thai`;
    const rows = parseQuizletText(raw);
    expect(rows[0].id).toBeTruthy();
    expect(rows[1].id).toBeTruthy();
    expect(rows[0].id).not.toBe(rows[1].id);
  });
});

describe('parseCsvOrTsv', () => {
  it('parses standard CSV with header row', () => {
    const csv = `English,Vietnamese,Part of Speech,CEFR Level,Topic\napple,quả táo,noun,A1,food\nrun,chạy,verb,A1,actions`;
    const rows = parseCsvOrTsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      english: 'apple',
      vietnamese: 'quả táo',
      partOfSpeech: 'noun',
      cefrLevel: 'A1',
      topic: 'food',
    });
    expect(rows[1]).toMatchObject({
      english: 'run',
      vietnamese: 'chạy',
      partOfSpeech: 'verb',
      cefrLevel: 'A1',
      topic: 'actions',
    });
  });

  it('parses CSV with Vietnamese headers', () => {
    const csv = `Tiếng Anh,Nghĩa,Từ loại,Cấp độ,Chủ đề,Phiên âm,Ví dụ,Dịch ví dụ
book,cuốn sách,danh từ,A1,school,/bʊk/,I read a book.,Tôi đọc một cuốn sách.`;
    const rows = parseCsvOrTsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].english).toBe('book');
    expect(rows[0].vietnamese).toBe('cuốn sách');
    expect(rows[0].partOfSpeech).toBe('danh từ');
    expect(rows[0].cefrLevel).toBe('A1');
    expect(rows[0].topic).toBe('school');
    expect(rows[0].phonetic).toBe('/bʊk/');
    expect(rows[0].exampleSentence).toBe('I read a book.');
    expect(rows[0].exampleTranslation).toBe('Tôi đọc một cuốn sách.');
  });

  it('handles quoted fields containing commas', () => {
    const csv = `English,Vietnamese\n"take off","cất cánh, rời đi"\n"check in","đăng ký, làm thủ tục"`;
    const rows = parseCsvOrTsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('take off');
    expect(rows[0].vietnamese).toBe('cất cánh, rời đi');
    expect(rows[1].vietnamese).toBe('đăng ký, làm thủ tục');
  });

  it('handles quoted fields containing newlines', () => {
    const csv = `English,Vietnamese\napple,"quả táo\nloại trái cây phổ biến"\nbanana,quả chuối`;
    const rows = parseCsvOrTsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('apple');
    expect(rows[0].vietnamese).toBe('quả táo\nloại trái cây phổ biến');
    expect(rows[1].english).toBe('banana');
  });

  it('handles escaped double quotes inside fields', () => {
    const csv = `English,Vietnamese\ngreet,"say ""hello"" warmly"`;
    const rows = parseCsvOrTsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].english).toBe('greet');
    expect(rows[0].vietnamese).toBe('say "hello" warmly');
  });

  it('parses TSV (tab-separated) spreadsheet pasted content', () => {
    const tsv = `English\tVietnamese\tTopic\ncomputer\tmáy vi tính\ttechnology\nkeyboard\tbàn phím\ttechnology`;
    const rows = parseCsvOrTsv(tsv);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('computer');
    expect(rows[0].vietnamese).toBe('máy vi tính');
    expect(rows[0].topic).toBe('technology');
  });

  it('parses table without headers using positional defaults', () => {
    // Col 0 -> english, Col 1 -> vietnamese, Col 2 -> partOfSpeech (since it's a known POS)
    const raw = `apple,quả táo,noun\nrun,chạy,verb`;
    const rows = parseCsvOrTsv(raw);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('apple');
    expect(rows[0].vietnamese).toBe('quả táo');
    expect(rows[0].partOfSpeech).toBe('noun');
  });

  it('parses table without headers when Col 2 is phonetic', () => {
    const raw = `apple,quả táo,/ˈæpl/\nbanana,quả chuối,/bəˈnænə/`;
    const rows = parseCsvOrTsv(raw);
    expect(rows).toHaveLength(2);
    expect(rows[0].english).toBe('apple');
    expect(rows[0].vietnamese).toBe('quả táo');
    expect(rows[0].phonetic).toBe('/ˈæpl/');
  });

  it('cleans row numbering on the english column in CSV/TSV', () => {
    const csv = `English,Vietnamese\n1. table,cái bàn\n2) chair,cái ghế`;
    const rows = parseCsvOrTsv(csv);
    expect(rows[0].english).toBe('table');
    expect(rows[1].english).toBe('chair');
  });

  it('returns empty array on blank input', () => {
    expect(parseCsvOrTsv('')).toEqual([]);
    expect(parseCsvOrTsv('   \n  ')).toEqual([]);
  });
});

describe('normalizeCefrLevel', () => {
  it('normalizes valid CEFR levels case-insensitively', () => {
    expect(normalizeCefrLevel('a1')).toBe('A1');
    expect(normalizeCefrLevel('A2')).toBe('A2');
    expect(normalizeCefrLevel('b1')).toBe('B1');
    expect(normalizeCefrLevel('B2')).toBe('B2');
    expect(normalizeCefrLevel('pre-a1')).toBe('Pre-A1');
    expect(normalizeCefrLevel('Pre A1')).toBe('Pre-A1');
  });

  it('returns fallback or null for invalid levels', () => {
    expect(normalizeCefrLevel('C1')).toBeNull();
    expect(normalizeCefrLevel('invalid', 'A1')).toBe('A1');
    expect(normalizeCefrLevel('', 'A2')).toBe('A2');
  });
});

describe('normalizePartOfSpeech', () => {
  it('normalizes standard parts of speech and abbreviations', () => {
    expect(normalizePartOfSpeech('noun')).toBe('noun');
    expect(normalizePartOfSpeech('N')).toBe('noun');
    expect(normalizePartOfSpeech('danh từ')).toBe('noun');

    expect(normalizePartOfSpeech('verb')).toBe('verb');
    expect(normalizePartOfSpeech('v')).toBe('verb');
    expect(normalizePartOfSpeech('động từ')).toBe('verb');

    expect(normalizePartOfSpeech('adjective')).toBe('adjective');
    expect(normalizePartOfSpeech('adj')).toBe('adjective');
    expect(normalizePartOfSpeech('tính từ')).toBe('adjective');

    expect(normalizePartOfSpeech('adverb')).toBe('adverb');
    expect(normalizePartOfSpeech('adv')).toBe('adverb');
    expect(normalizePartOfSpeech('trạng từ')).toBe('adverb');

    expect(normalizePartOfSpeech('phrase')).toBe('phrase');
    expect(normalizePartOfSpeech('idiom')).toBe('phrase');
    expect(normalizePartOfSpeech('cụm từ')).toBe('phrase');
  });

  it('returns fallback or null for invalid parts of speech', () => {
    expect(normalizePartOfSpeech('unknown')).toBeNull();
    expect(normalizePartOfSpeech('unknown', 'noun')).toBe('noun');
  });
});

describe('validateImportRows', () => {
  it('marks completely valid rows as "valid" and selected', () => {
    const rawRows: RawImportRow[] = [
      { id: '1', english: 'apple', vietnamese: 'quả táo', cefrLevel: 'A1', partOfSpeech: 'noun' },
      { id: '2', english: 'run', vietnamese: 'chạy', cefrLevel: 'A2', partOfSpeech: 'verb' },
    ];

    const { rows, summary } = validateImportRows(rawRows);
    expect(rows).toHaveLength(2);
    expect(rows[0].status).toBe('valid');
    expect(rows[0].isSelected).toBe(true);
    expect(rows[0].cefrLevel).toBe('A1');
    expect(rows[0].partOfSpeech).toBe('noun');

    expect(summary).toEqual({
      total: 2,
      validCount: 2,
      warningCount: 0,
      duplicateCount: 0,
      errorCount: 0,
    });
  });

  it('marks rows missing english or vietnamese as "error" and unselected', () => {
    const rawRows: RawImportRow[] = [
      { id: '1', english: '', vietnamese: 'quả táo' },
      { id: '2', english: 'orange', vietnamese: '' },
      { id: '3', english: '   ', vietnamese: '   ' },
    ];

    const { rows, summary } = validateImportRows(rawRows);
    expect(rows[0].status).toBe('error');
    expect(rows[0].isSelected).toBe(false);
    expect(rows[0].validationMessage).toContain('English');

    expect(rows[1].status).toBe('error');
    expect(rows[1].isSelected).toBe(false);
    expect(rows[1].validationMessage).toContain('Vietnamese');

    expect(rows[2].status).toBe('error');
    expect(rows[2].isSelected).toBe(false);

    expect(summary.errorCount).toBe(3);
    expect(summary.validCount).toBe(0);
  });

  it('detects in-batch duplicates (case-insensitive and trimmed)', () => {
    const rawRows: RawImportRow[] = [
      { id: '1', english: 'apple', vietnamese: 'quả táo' },
      { id: '2', english: 'banana', vietnamese: 'quả chuối' },
      { id: '3', english: ' Apple ', vietnamese: 'trái táo khác' },
    ];

    const { rows, summary } = validateImportRows(rawRows);
    expect(rows[0].status).toBe('valid');
    expect(rows[0].isSelected).toBe(true);

    expect(rows[1].status).toBe('valid');

    expect(rows[2].status).toBe('duplicate');
    expect(rows[2].isSelected).toBe(false);
    expect(rows[2].validationMessage).toContain('Duplicate word');

    expect(summary.duplicateCount).toBe(1);
    expect(summary.validCount).toBe(2);
  });

  it('detects conflicts against existingWords set as "warning" and unselected', () => {
    const existingWords = new Set(['cat', 'dog']);
    const rawRows: RawImportRow[] = [
      { id: '1', english: 'cat', vietnamese: 'con mèo' },
      { id: '2', english: 'bird', vietnamese: 'con chim' },
    ];

    const { rows, summary } = validateImportRows(rawRows, undefined, existingWords);
    expect(rows[0].status).toBe('warning');
    expect(rows[0].isSelected).toBe(false);
    expect(rows[0].validationMessage).toContain('already exists');

    expect(rows[1].status).toBe('valid');
    expect(rows[1].isSelected).toBe(true);

    expect(summary.warningCount).toBe(1);
    expect(summary.validCount).toBe(1);
  });

  it('falls back to default CEFR and POS with warning if invalid values provided', () => {
    const rawRows: RawImportRow[] = [
      { id: '1', english: 'apple', vietnamese: 'quả táo', cefrLevel: 'Z9', partOfSpeech: 'alien' },
    ];

    const { rows, summary } = validateImportRows(rawRows);
    expect(rows[0].status).toBe('warning');
    expect(rows[0].cefrLevel).toBe('A1'); // default A1
    expect(rows[0].partOfSpeech).toBe('noun'); // default noun
    expect(rows[0].validationMessage).toContain('Defaulted');
    expect(summary.warningCount).toBe(1);
  });

  it('applies parse options for defaults when fields are unspecified', () => {
    const options: ImportParseOptions = {
      defaultCefrLevel: 'B1',
      defaultPartOfSpeech: 'verb',
      defaultTopic: 'travel',
    };

    const rawRows: RawImportRow[] = [
      { id: '1', english: 'fly', vietnamese: 'bay' },
    ];

    const { rows, summary } = validateImportRows(rawRows, options);
    expect(rows[0].status).toBe('valid');
    expect(rows[0].cefrLevel).toBe('B1');
    expect(rows[0].partOfSpeech).toBe('verb');
    expect(rows[0].topic).toBe('travel');
    expect(summary.validCount).toBe(1);
    expect(summary.warningCount).toBe(0);
  });

  it('normalizes null values for optional empty strings', () => {
    const rawRows: RawImportRow[] = [
      {
        id: '1',
        english: 'book',
        vietnamese: 'sách',
        phonetic: '   ',
        exampleSentence: '',
        exampleTranslation: undefined,
      },
    ];

    const { rows } = validateImportRows(rawRows);
    expect(rows[0].phonetic).toBeNull();
    expect(rows[0].exampleSentence).toBeNull();
    expect(rows[0].exampleTranslation).toBeNull();
  });
});

describe('formatRowsForWordBank', () => {
  it('transforms valid and selected rows into CreateWordBankInput payload', () => {
    const validatedRows: ValidatedImportRow[] = [
      {
        id: '1',
        english: 'apple',
        vietnamese: 'quả táo',
        phonetic: '/ˈæpl/',
        partOfSpeech: 'noun',
        cefrLevel: 'A1',
        topic: 'fruits',
        exampleSentence: 'I eat an apple.',
        exampleTranslation: 'Tôi ăn một quả táo.',
        status: 'valid',
        isSelected: true,
      },
      {
        id: '2',
        english: 'banana',
        vietnamese: 'quả chuối',
        phonetic: null,
        partOfSpeech: 'noun',
        cefrLevel: 'A1',
        topic: 'fruits',
        exampleSentence: null,
        exampleTranslation: null,
        status: 'valid',
        isSelected: false, // Deselected
      },
      {
        id: '3',
        english: '',
        vietnamese: 'lỗi',
        phonetic: null,
        partOfSpeech: 'noun',
        cefrLevel: 'A1',
        topic: 'general',
        exampleSentence: null,
        exampleTranslation: null,
        status: 'error',
        isSelected: true, // Error row should never be imported
      },
      {
        id: '4',
        english: 'cherry',
        vietnamese: 'quả anh đào',
        phonetic: null,
        partOfSpeech: 'noun',
        cefrLevel: 'A2',
        topic: 'fruits',
        exampleSentence: null,
        exampleTranslation: null,
        status: 'warning',
        isSelected: true, // Teacher manually selected a warning row to override
      },
    ];

    const payload = formatRowsForWordBank(validatedRows);
    expect(payload).toHaveLength(2);
    expect(payload[0]).toEqual({
      english: 'apple',
      vietnamese: 'quả táo',
      phonetic: '/ˈæpl/',
      partOfSpeech: 'noun',
      cefrLevel: 'A1',
      topic: 'fruits',
      exampleSentence: 'I eat an apple.',
      exampleTranslation: 'Tôi ăn một quả táo.',
      distractors: [],
    });
    expect(payload[1]).toEqual({
      english: 'cherry',
      vietnamese: 'quả anh đào',
      phonetic: null,
      partOfSpeech: 'noun',
      cefrLevel: 'A2',
      topic: 'fruits',
      exampleSentence: null,
      exampleTranslation: null,
      distractors: [],
    });
  });
});
