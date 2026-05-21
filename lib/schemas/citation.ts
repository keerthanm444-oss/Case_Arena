import { z } from 'zod';
import { APPROVED_PUBLISHERS } from '../../types/citation';

export   const SourceTypeSchema = z.enum([
    'academic',
    'consulting-firm',
    'competition',
    'book',
    'journal',
    'firm-report',
    'generic',
  ]);


/**
 * Publisher schema: must be in the approved list UNLESS the citation is
 * explicitly flagged with needsVerification=true. The linter (System 3)
 * blocks production builds that still contain needsVerification=true.
 */
export const CitationSchema = z
  .object({
    id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'kebab-case ids only'),
    type: SourceTypeSchema,
    publisher: z.string().min(1),
    title: z.string().min(1),
    authors: z.array(z.string()).optional(),
    year: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    locator: z.string().optional(),
    url: z.string().url().optional(),
    quote: z
      .string()
      .optional()
      .refine(
        (q) => !q || q.trim().split(/\s+/).length <= 15,
        'Quote must be ≤15 words (copyright)',
      ),
    needsVerification: z.boolean().optional(),
  })
  .superRefine((c, ctx) => {
    // If not flagged for verification, publisher must be approved
    if (
      !c.needsVerification &&
      !APPROVED_PUBLISHERS.includes(c.publisher as never)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Publisher "${c.publisher}" not in approved list. Add to APPROVED_PUBLISHERS or set needsVerification=true.`,
        path: ['publisher'],
      });
    }
  });

export const ClaimSchema = z.object({
  text: z.string().min(1),
  citationIds: z.array(z.string().min(1)).min(1, 'A claim needs ≥1 citation'),
});
