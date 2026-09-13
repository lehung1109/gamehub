import { describe, it, expect } from 'vitest';
import {
  IMPORT_ROW_STATUSES,
  COMMUNITY_SORT_OPTIONS,
  type ImportRowStatus,
  type RawImportRow,
  type ValidatedImportRow,
  type ImportValidationSummary,
  type ImportParseOptions,
  type CommunitySharedConfig,
  type GetCommunityConfigsFilter,
  type ShareConfigInput,
  type CommunityConfigResponse,
} from '@/types';
import {
  IMPORT_ROW_STATUSES as DIRECT_IMPORT_ROW_STATUSES,
  type ImportRowStatus as DirectImportRowStatus,
  type RawImportRow as DirectRawImportRow,
  type ValidatedImportRow as DirectValidatedImportRow,
  type ImportValidationSummary as DirectImportValidationSummary,
  type ImportParseOptions as DirectImportParseOptions,
} from '@/types/importer';
import {
  COMMUNITY_SORT_OPTIONS as DIRECT_COMMUNITY_SORT_OPTIONS,
  type CommunitySharedConfig as DirectCommunitySharedConfig,
  type GetCommunityConfigsFilter as DirectGetCommunityConfigsFilter,
  type ShareConfigInput as DirectShareConfigInput,
  type CommunityConfigResponse as DirectCommunityConfigResponse,
} from '@/types/community';

describe('Importer and Community TypeScript Contracts', () => {
  describe('Importer Types', () => {
    it('exports IMPORT_ROW_STATUSES containing all valid row statuses', () => {
      expect(IMPORT_ROW_STATUSES).toEqual(['valid', 'warning', 'duplicate', 'error']);
      expect(DIRECT_IMPORT_ROW_STATUSES).toEqual(IMPORT_ROW_STATUSES);
    });

    it('allows valid ImportRowStatus values', () => {
      const statuses: ImportRowStatus[] = ['valid', 'warning', 'duplicate', 'error'];
      expect(statuses).toEqual(['valid', 'warning', 'duplicate', 'error']);
    });

    it('constructs a valid RawImportRow object', () => {
      const rawRow: RawImportRow = {
        id: 'row-1',
        english: 'apple',
        vietnamese: 'quả táo',
        phonetic: '/ˈæp.əl/',
        partOfSpeech: 'noun',
        cefrLevel: 'A1',
        topic: 'food',
        exampleSentence: 'I eat an apple.',
        exampleTranslation: 'Tôi ăn một quả táo.',
      };

      expect(rawRow.id).toBe('row-1');
      expect(rawRow.english).toBe('apple');
      expect(rawRow.vietnamese).toBe('quả táo');
      expect(rawRow.phonetic).toBe('/ˈæp.əl/');
      expect(rawRow.partOfSpeech).toBe('noun');
      expect(rawRow.cefrLevel).toBe('A1');
      expect(rawRow.topic).toBe('food');
      expect(rawRow.exampleSentence).toBe('I eat an apple.');
      expect(rawRow.exampleTranslation).toBe('Tôi ăn một quả táo.');
    });

    it('constructs a valid ValidatedImportRow object with required and optional fields', () => {
      const validatedRow: ValidatedImportRow = {
        id: 'row-valid-1',
        english: 'cat',
        vietnamese: 'con mèo',
        phonetic: '/kæt/',
        partOfSpeech: 'noun',
        cefrLevel: 'A1',
        topic: 'animals',
        exampleSentence: 'The cat sleeps.',
        exampleTranslation: 'Con mèo đang ngủ.',
        status: 'valid',
        validationMessage: undefined,
        isSelected: true,
      };

      expect(validatedRow.id).toBe('row-valid-1');
      expect(validatedRow.status).toBe('valid');
      expect(validatedRow.isSelected).toBe(true);
      expect(validatedRow.phonetic).toBe('/kæt/');
    });

    it('allows null phonetic and example fields in ValidatedImportRow', () => {
      const rowWithNulls: ValidatedImportRow = {
        id: 'row-valid-2',
        english: 'run',
        vietnamese: 'chạy',
        phonetic: null,
        partOfSpeech: 'verb',
        cefrLevel: 'A1',
        topic: 'actions',
        exampleSentence: null,
        exampleTranslation: null,
        status: 'warning',
        validationMessage: 'Missing example sentence',
        isSelected: false,
      };

      expect(rowWithNulls.phonetic).toBeNull();
      expect(rowWithNulls.exampleSentence).toBeNull();
      expect(rowWithNulls.exampleTranslation).toBeNull();
      expect(rowWithNulls.status).toBe('warning');
      expect(rowWithNulls.validationMessage).toBe('Missing example sentence');
    });

    it('constructs an ImportValidationSummary object', () => {
      const summary: ImportValidationSummary = {
        total: 10,
        validCount: 7,
        warningCount: 2,
        duplicateCount: 1,
        errorCount: 0,
      };

      expect(summary.total).toBe(10);
      expect(summary.validCount).toBe(7);
      expect(summary.warningCount).toBe(2);
      expect(summary.duplicateCount).toBe(1);
      expect(summary.errorCount).toBe(0);
    });

    it('constructs ImportParseOptions object with optional fields', () => {
      const options: ImportParseOptions = {
        delimiter: '\t',
        hasHeader: true,
        defaultCefrLevel: 'A2',
        defaultTopic: 'travel',
        defaultPartOfSpeech: 'phrase',
      };

      expect(options.delimiter).toBe('\t');
      expect(options.hasHeader).toBe(true);
      expect(options.defaultCefrLevel).toBe('A2');
      expect(options.defaultTopic).toBe('travel');
      expect(options.defaultPartOfSpeech).toBe('phrase');

      const emptyOptions: ImportParseOptions = {};
      expect(emptyOptions.delimiter).toBeUndefined();
    });

    it('matches directly imported types from @/types/importer', () => {
      const row: DirectValidatedImportRow = {
        id: 'direct-1',
        english: 'dog',
        vietnamese: 'chó',
        phonetic: '/dɒɡ/',
        partOfSpeech: 'noun',
        cefrLevel: 'Pre-A1',
        topic: 'animals',
        exampleSentence: null,
        exampleTranslation: null,
        status: 'valid' as DirectImportRowStatus,
        isSelected: true,
      };

      const raw: DirectRawImportRow = {
        id: 'r1',
        english: 'dog',
        vietnamese: 'chó',
      };

      const summary: DirectImportValidationSummary = {
        total: 1,
        validCount: 1,
        warningCount: 0,
        duplicateCount: 0,
        errorCount: 0,
      };

      const opts: DirectImportParseOptions = {
        defaultCefrLevel: 'Pre-A1',
      };

      expect(row.english).toBe('dog');
      expect(raw.english).toBe('dog');
      expect(summary.total).toBe(1);
      expect(opts.defaultCefrLevel).toBe('Pre-A1');
    });
  });

  describe('Community Library Types', () => {
    it('exports COMMUNITY_SORT_OPTIONS containing all sort modes', () => {
      expect(COMMUNITY_SORT_OPTIONS).toEqual(['newest', 'popular', 'clones']);
      expect(DIRECT_COMMUNITY_SORT_OPTIONS).toEqual(COMMUNITY_SORT_OPTIONS);
    });

    it('constructs a valid CommunitySharedConfig object', () => {
      const sharedConfig: CommunitySharedConfig = {
        id: 'shared-101',
        configId: 'cfg-55',
        authorId: 'usr-1',
        authorName: 'Cô Lan Anh',
        title: 'IELTS Band 6.0 Environment Vocab',
        description: 'Bộ từ vựng chủ đề môi trường cho lớp 10 chuyên',
        gameId: 'flashcard',
        cefrLevel: 'B2',
        topic: 'environment',
        tags: ['ielts', 'b2', 'environment'],
        settings: {
          wordLimit: 20,
          shuffle: true,
        },
        likesCount: 15,
        cloneCount: 8,
        createdAt: '2026-09-13T09:00:00.000Z',
        updatedAt: '2026-09-13T09:30:00.000Z',
        isLikedByMe: true,
      };

      expect(sharedConfig.id).toBe('shared-101');
      expect(sharedConfig.configId).toBe('cfg-55');
      expect(sharedConfig.authorName).toBe('Cô Lan Anh');
      expect(sharedConfig.cefrLevel).toBe('B2');
      expect(sharedConfig.tags).toContain('ielts');
      expect(sharedConfig.likesCount).toBe(15);
      expect(sharedConfig.cloneCount).toBe(8);
      expect(sharedConfig.isLikedByMe).toBe(true);
    });

    it('allows null configId and null description in CommunitySharedConfig', () => {
      const minimalConfig: CommunitySharedConfig = {
        id: 'shared-102',
        configId: null,
        authorId: 'usr-2',
        authorName: 'Thầy Minh',
        title: 'Basic Phonics A1',
        description: null,
        gameId: 'wordle',
        cefrLevel: 'A1',
        topic: 'phonics',
        tags: [],
        settings: {},
        likesCount: 0,
        cloneCount: 0,
        createdAt: '2026-09-13T10:00:00.000Z',
        updatedAt: '2026-09-13T10:00:00.000Z',
      };

      expect(minimalConfig.configId).toBeNull();
      expect(minimalConfig.description).toBeNull();
      expect(minimalConfig.isLikedByMe).toBeUndefined();
    });

    it('constructs GetCommunityConfigsFilter with filter combinations', () => {
      const filterAll: GetCommunityConfigsFilter = {
        gameId: 'flashcard',
        cefrLevel: 'all',
        topic: 'animals',
        search: 'pet',
        sortBy: 'popular',
        page: 1,
        pageSize: 12,
      };

      expect(filterAll.gameId).toBe('flashcard');
      expect(filterAll.cefrLevel).toBe('all');
      expect(filterAll.sortBy).toBe('popular');
      expect(filterAll.page).toBe(1);
      expect(filterAll.pageSize).toBe(12);

      const filterSpecific: GetCommunityConfigsFilter = {
        cefrLevel: 'B1',
        sortBy: 'clones',
      };
      expect(filterSpecific.cefrLevel).toBe('B1');
      expect(filterSpecific.sortBy).toBe('clones');
    });

    it('constructs ShareConfigInput with required and optional fields', () => {
      const shareInput: ShareConfigInput = {
        configId: 'cfg-99',
        title: 'Daily Conversational English',
        description: 'Common sentences for middle school students',
        cefrLevel: 'A2',
        topic: 'daily-life',
        tags: ['grade7', 'speaking'],
      };

      expect(shareInput.configId).toBe('cfg-99');
      expect(shareInput.title).toBe('Daily Conversational English');
      expect(shareInput.cefrLevel).toBe('A2');
      expect(shareInput.topic).toBe('daily-life');
      expect(shareInput.tags).toHaveLength(2);

      const minimalShare: ShareConfigInput = {
        configId: 'cfg-100',
        title: 'Irregular Verbs',
        cefrLevel: 'B1',
        topic: 'grammar',
      };
      expect(minimalShare.description).toBeUndefined();
      expect(minimalShare.tags).toBeUndefined();
    });

    it('constructs CommunityConfigResponse generic structure', () => {
      const successListResponse: CommunityConfigResponse<CommunitySharedConfig[]> = {
        success: true,
        data: [],
        total: 0,
      };

      expect(successListResponse.success).toBe(true);
      expect(successListResponse.data).toEqual([]);
      expect(successListResponse.total).toBe(0);

      const errorResponse: CommunityConfigResponse<null> = {
        success: false,
        error: 'Failed to fetch community configurations',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Failed to fetch community configurations');
    });

    it('matches directly imported types from @/types/community', () => {
      const directConfig: DirectCommunitySharedConfig = {
        id: 'd-1',
        configId: null,
        authorId: 'u-1',
        authorName: 'Teacher',
        title: 'Title',
        description: null,
        gameId: 'hangman',
        cefrLevel: 'A2',
        topic: 'general',
        tags: [],
        settings: {},
        likesCount: 1,
        cloneCount: 2,
        createdAt: '2026-09-13T00:00:00Z',
        updatedAt: '2026-09-13T00:00:00Z',
      };

      const directFilter: DirectGetCommunityConfigsFilter = {
        sortBy: 'newest',
      };

      const directInput: DirectShareConfigInput = {
        configId: 'c-1',
        title: 'T',
        cefrLevel: 'Pre-A1',
        topic: 'top',
      };

      const directResp: DirectCommunityConfigResponse<string> = {
        success: true,
        data: 'ok',
      };

      expect(directConfig.id).toBe('d-1');
      expect(directFilter.sortBy).toBe('newest');
      expect(directInput.title).toBe('T');
      expect(directResp.data).toBe('ok');
    });
  });
});
