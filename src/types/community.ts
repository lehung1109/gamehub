import type { CefrLevel } from './word-bank';

export const COMMUNITY_SORT_OPTIONS = ['newest', 'popular', 'clones'] as const;
export type CommunitySortOption = (typeof COMMUNITY_SORT_OPTIONS)[number];

export interface CommunitySharedConfig {
  id: string;
  configId: string | null;
  authorId: string;
  authorName: string;
  title: string;
  description: string | null;
  gameId: string;
  cefrLevel: CefrLevel;
  topic: string;
  tags: string[];
  settings: Record<string, unknown>;
  likesCount: number;
  cloneCount: number;
  createdAt: string;
  updatedAt: string;
  isLikedByMe?: boolean;
}

export interface GetCommunityConfigsFilter {
  gameId?: string;
  cefrLevel?: CefrLevel | 'all';
  topic?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'clones';
  page?: number;
  pageSize?: number;
}

export interface ShareConfigInput {
  configId: string;
  title: string;
  description?: string;
  cefrLevel: CefrLevel;
  topic: string;
  tags?: string[];
}

export interface CommunityConfigResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}
