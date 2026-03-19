import { z } from 'zod';

// ===========================
// COMPANY VALIDATION
// ===========================

export const companySchema = z.object({
  name: z.string().min(1, '회사명은 필수입니다'),
  industry: z.string().optional().nullable(),
  website: z.union([
    z.string().url('올바른 URL 형식이 아닙니다'),
    z.literal(''),
    z.null(),
  ]).optional(),
  address: z.string().optional().nullable(),
  employeeCount: z.number().int().positive('양수만 입력 가능합니다').optional().nullable(),
  memo: z.string().optional().nullable(),
});

export type CompanyInput = z.infer<typeof companySchema>;

// ===========================
// CONTACT VALIDATION
// ===========================

export const contactSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.union([
    z.string().email('올바른 이메일 형식이 아닙니다'),
    z.literal(''),
    z.null(),
  ]).optional(),
  phone: z.union([
    z.string().regex(/^[\d\s\-()]+$/, '올바른 전화번호 형식이 아닙니다'),
    z.literal(''),
    z.null(),
  ]).optional(),
  position: z.string().optional().nullable(),
  companyId: z.string().uuid().optional().or(z.literal('')).nullable(),
  memo: z.string().optional().nullable(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ===========================
// DEAL VALIDATION
// ===========================

export const dealStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;
export type DealStage = typeof dealStages[number];

export const dealSchema = z.object({
  title: z.string().min(1, '거래명은 필수입니다'),
  amount: z.number().int().min(0, '금액은 0 이상이어야 합니다').default(0),
  stage: z.enum(dealStages).default('lead'),
  expectedCloseDate: z.string().optional().or(z.literal('')).nullable(),
  contactId: z.string().uuid().optional().or(z.literal('')).nullable(),
  companyId: z.string().uuid().optional().or(z.literal('')).nullable(),
  memo: z.string().optional().nullable(),
});

export type DealInput = z.infer<typeof dealSchema>;

// Deal stage update with optimistic locking
export const dealStageUpdateSchema = z.object({
  stage: z.enum(dealStages),
  updatedAt: z.string().datetime(), // For optimistic locking
});

export type DealStageUpdate = z.infer<typeof dealStageUpdateSchema>;

// ===========================
// ACTIVITY VALIDATION
// ===========================

export const activityTypes = ['call', 'email', 'meeting', 'note'] as const;
export type ActivityType = typeof activityTypes[number];

export const activitySchema = z.object({
  type: z.enum(activityTypes),
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
})
.refine(
  (data) => data.contactId || data.companyId || data.dealId,
  {
    message: '연락처, 회사, 거래 중 최소 하나는 연결해야 합니다',
    path: ['contactId'], // Error will be shown on contactId field
  }
);

export type ActivityInput = z.infer<typeof activitySchema>;

// ===========================
// TASK VALIDATION
// ===========================

export const priorities = ['low', 'medium', 'high'] as const;
export type Priority = typeof priorities[number];

export const taskSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(priorities).default('medium'),
  contactId: z.string().uuid().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;

// ===========================
// TAG VALIDATION
// ===========================

export const tagSchema = z.object({
  name: z.string().min(1, '태그명은 필수입니다').max(50, '태그명은 50자 이내여야 합니다'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 Hex 색상 형식이 아닙니다 (예: #FF5733)'),
});

export type TagInput = z.infer<typeof tagSchema>;

// ===========================
// EMAIL TEMPLATE VALIDATION
// ===========================

export const emailTemplateSchema = z.object({
  name: z.string().min(1, '템플릿명은 필수입니다'),
  subject: z.string().min(1, '제목은 필수입니다'),
  body: z.string().min(1, '본문은 필수입니다'),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

// ===========================
// PAGINATION VALIDATION
// ===========================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Cursor-based pagination
export const cursorPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(20),
});

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;

// ===========================
// SEARCH VALIDATION
// ===========================

export const searchSchema = z.object({
  query: z.string().min(1, '검색어는 필수입니다'),
  limit: z.number().int().positive().max(50).default(10),
});

export type SearchInput = z.infer<typeof searchSchema>;
