import { z } from 'zod';
import { CitationSchema } from './citation';

// ---------- Framework ----------

export const FrameworkCategorySchema = z.enum([
  'profitability',
  'market-entry',
  'm-and-a',
  'pricing',
  'operations',
  'market-sizing',
  'porters-five-forces',
  '3c',
  '4p',
  '7s',
  'value-chain',
  'pyramid-principle',
  'mece',
  'custom',
]);

const FrameworkNodeBase = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  prompt: z.string().optional(),
  explanation: z.string().optional(),
});
export type FrameworkNodeInput = z.infer<typeof FrameworkNodeBase> & {
  children?: FrameworkNodeInput[];
};
export const FrameworkNodeSchema: z.ZodType<FrameworkNodeInput> =
  FrameworkNodeBase.extend({
    children: z.lazy(() => FrameworkNodeSchema.array().optional()),
  });

export const FrameworkSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'kebab-case slug'),
  name: z.string().min(1),
  category: FrameworkCategorySchema,
  whenToUse: z.string().min(1),
  whenNotToUse: z.string().optional(),
  tree: FrameworkNodeSchema,
  citations: z.array(CitationSchema).min(1, 'frameworks require ≥1 citation'),
  forkedFrom: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

// ---------- Case ----------

export const CaseIndustrySchema = z.enum([
  'retail',
  'cpg',
  'tech-saas',
  'tech-consumer',
  'financial-services',
  'healthcare',
  'pharma',
  'energy',
  'manufacturing',
  'transportation',
  'media',
  'telecom',
  'food-and-beverage',
  'airline',
  'hospitality',
  'social-impact',
  'public-sector',
  'education',
]);

export const CaseDifficultySchema = z.enum([
  'intro',
  'standard',
  'advanced',
  'final-round',
]);

export const CaseCategorySchema = z.enum([
  'profitability',
  'market-entry',
  'm-and-a',
  'pricing',
  'operations',
  'market-sizing',
  'social-impact',
  'investment-decision',
  'turnaround',
  'new-product',
]);

export const CaseAssumptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  default: z.boolean(),
  effectDescription: z.string().min(1),
  numericDeltas: z.record(z.string(), z.number()).optional(),
  activatesBranches: z.array(z.string()).optional(),
});

export const CaseQuantInputSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().optional(),
  range: z.tuple([z.number(), z.number(), z.number()]),
  step: z.number().positive().optional(),
  citationId: z.string().optional(),
});

export const CaseDerivedMetricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().optional(),
  expression: z.string().min(1),
  display: z.string().optional(),
});

const CaseIssueTreeNodeBase = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  note: z.string().optional(),
  branchId: z.string().optional(),
});
export type CaseIssueTreeNodeInput = z.infer<typeof CaseIssueTreeNodeBase> & {
  children?: CaseIssueTreeNodeInput[];
};
export const CaseIssueTreeNodeSchema: z.ZodType<CaseIssueTreeNodeInput> =
  CaseIssueTreeNodeBase.extend({
    children: z.lazy(() => CaseIssueTreeNodeSchema.array().optional()),
  });

export const CaseRecommendationSchema = z.object({
  primary: z.string().min(1),
  rationale: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  nextSteps: z.array(z.string()).min(1),
});

export const CaseJudgeNotesSchema = z.object({
  rubricCitationId: z.string().min(1),
  whatTopTeamsDid: z.array(z.string()).min(1),
  commonPointLoss: z.array(z.string()).min(1),
});

export const CaseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case slug'),
  title: z.string().min(1),
  source: CitationSchema,
  industry: CaseIndustrySchema,
  category: CaseCategorySchema,
  difficulty: CaseDifficultySchema,
  frameworks: z.array(FrameworkCategorySchema).min(1),
  timeEstimate: z.number().int().positive(),
  tags: z.array(z.string()),
  problemStatement: z.string().min(1),
  clarifyingQuestions: z.array(z.string()),
  assumptions: z.array(CaseAssumptionSchema),
  quantInputs: z.array(CaseQuantInputSchema),
  derivedMetrics: z.array(CaseDerivedMetricSchema),
  issueTree: CaseIssueTreeNodeSchema,
  frameworkRationale: z.string().min(1),
  recommendation: CaseRecommendationSchema,
  judgeNotes: CaseJudgeNotesSchema.optional(),
  commonMistakes: z.array(z.string()),
  variants: z.array(z.string()),
  relatedCases: z.array(z.string()),
  solved: z.boolean(),
  updatedAt: z.string().datetime(),
});

// ---------- Module ----------

export const ModuleStatusSchema = z.enum(['draft', 'verified', 'published']);

export const ModuleSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
});

export const ModulePrerequisiteSchema = z.object({
  slug: z.string().min(1),
  hard: z.boolean(),
});

export const ModuleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  learningOutcomes: z.array(z.string()).min(1),
  prerequisites: z.array(ModulePrerequisiteSchema),
  sections: z.array(ModuleSectionSchema).min(1),
  citations: z.array(CitationSchema),
  embeddedMuscles: z
    .array(z.string())
    .min(1, 'Every module must embed ≥1 interactive muscle (L2 rule)'),
  linkedCases: z.array(z.string()),
  status: ModuleStatusSchema,
  updatedAt: z.string().datetime(),
});
