import { describe, it, expect } from 'vitest';
import { CitationSchema, ClaimSchema } from '@/lib/schemas';
import { APPROVED_PUBLISHERS } from '@/types/citation';

/**
 * The citation schema is the heart of the no-hallucination contract.
 * These tests pin its behavior — every regression here is a content-trust
 * regression and should be loud.
 */

const baseCitation = {
  id: 'cosentino-2023',
  type: 'book' as const,
  publisher: 'Case in Point',
  title: 'Case in Point — Complete Case Interview Preparation',
  authors: ['Cosentino, Marc'],
  year: 2023,
};

describe('CitationSchema — quote ceiling (copyright)', () => {
  it('accepts a quote of exactly 15 words', () => {
    const fifteen = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen';
    expect(CitationSchema.safeParse({ ...baseCitation, quote: fifteen }).success).toBe(true);
  });

  it('rejects a 16-word quote', () => {
    const sixteen = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen';
    const r = CitationSchema.safeParse({ ...baseCitation, quote: sixteen });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('15 words'))).toBe(true);
    }
  });

  it('accepts no quote at all', () => {
    expect(CitationSchema.safeParse(baseCitation).success).toBe(true);
  });
});

describe('CitationSchema — publisher whitelist', () => {
  it('accepts every publisher in the approved list', () => {
    for (const publisher of APPROVED_PUBLISHERS) {
      const r = CitationSchema.safeParse({ ...baseCitation, publisher });
      expect(r.success, `publisher "${publisher}" should be accepted`).toBe(true);
    }
  });

  it('rejects an unknown publisher without needsVerification', () => {
    const r = CitationSchema.safeParse({
      ...baseCitation,
      publisher: 'TotallyMadeUpJournal',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.message.includes('Publisher'))).toBe(true);
    }
  });

  it('accepts an unknown publisher when flagged needsVerification', () => {
    const r = CitationSchema.safeParse({
      ...baseCitation,
      publisher: 'TotallyMadeUpJournal',
      needsVerification: true,
    });
    expect(r.success).toBe(true);
  });
});

describe('CitationSchema — identity + year sanity', () => {
  it('requires kebab-case id', () => {
    expect(
      CitationSchema.safeParse({ ...baseCitation, id: 'CamelCaseId' }).success,
    ).toBe(false);
    expect(
      CitationSchema.safeParse({ ...baseCitation, id: 'snake_case' }).success,
    ).toBe(false);
    expect(
      CitationSchema.safeParse({ ...baseCitation, id: 'kebab-case-ok' }).success,
    ).toBe(true);
  });

  it('rejects year < 1900', () => {
    expect(
      CitationSchema.safeParse({ ...baseCitation, year: 1899 }).success,
    ).toBe(false);
  });

  it('rejects implausible future years', () => {
    expect(
      CitationSchema.safeParse({
        ...baseCitation,
        year: new Date().getFullYear() + 5,
      }).success,
    ).toBe(false);
  });
});

describe('ClaimSchema — every claim needs a citation', () => {
  it('rejects a claim with empty citationIds', () => {
    expect(
      ClaimSchema.safeParse({ text: 'Coffee sells', citationIds: [] }).success,
    ).toBe(false);
  });

  it('accepts a single-citation claim', () => {
    expect(
      ClaimSchema.safeParse({
        text: 'Coffee sells',
        citationIds: ['cosentino-2023'],
      }).success,
    ).toBe(true);
  });
});
