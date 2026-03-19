// types/api.ts

/**
 * API 응답 타입 정의
 */

// 성공 응답
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 에러 응답
export interface ApiError {
  success: false;
  error: string;
  code: string;
  statusCode: number;
}

// 페이지네이션 메타데이터
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// API 응답 유니온 타입
export type ApiResult<T> = ApiResponse<T> | ApiError;

// 페이지네이션 쿼리 파라미터
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 검색 쿼리 파라미터
export interface SearchQuery extends PaginationQuery {
  query?: string;
  filters?: Record<string, string | number | boolean>;
}

/**
 * AI 관련 타입
 */

// AI 요청 메타데이터
export interface AIRequestMetadata {
  requestId: string;
  timestamp: Date;
  userId: string;
}

// AI 응답 메타데이터
export interface AIResponseMetadata {
  model: string;
  tokensUsed: number;
  responseTime: number;
  confidence?: number;
}

// AI 응답 포맷
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: AIResponseMetadata;
}
