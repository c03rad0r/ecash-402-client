import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['incoming', 'outgoing', 'credit', 'redemption']),
  amount: z.number(),
  status: z.enum(['pending', 'completed', 'failed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z.string().optional(),
  reference: z.string().optional(),
  creditId: z.string().optional(),
  creditExpiry: z.string().datetime().optional(),
  redemptionDate: z.string().datetime().optional(),
});

export const TransactionListParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  type: z
    .enum(['incoming', 'outgoing', 'credit', 'redemption', 'all'])
    .optional(),
  status: z.enum(['pending', 'completed', 'failed', 'all']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const TransactionListResponseSchema = z.object({
  data: z.array(TransactionSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  }),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionListParams = z.infer<typeof TransactionListParamsSchema>;
export type TransactionListResponse = z.infer<
  typeof TransactionListResponseSchema
>;
