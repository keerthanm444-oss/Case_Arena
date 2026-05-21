import { describe, it, expect } from 'vitest';
import { CitationSchema } from '@/lib/schemas/citation';

describe('citation Zod schema', () => {
  it('accepts a valid citation from an approved publisher', () => {
    const r = CitationSchema.safeParse({
      id: 'hbs-test',
      type: 'academic',
      publisher: 'Harvard Business School',
      title: 'A test case',
      year: 2024,
    });
    expect(r.success).toBe(true);
  });

  it('rejects a quote longer than 15 words', () => {
    const longQuote =
      'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen';
    const r = CitationSchema.safeParse({
      id: 'hbs-quote',
      type: 'academic',
      publisher: 'Harvard Business School',
      title: 'Quote test',
      quote: longQuote,
    });
    expect(r.success).toBe(false);
  });

  it('accepts a quote with exactly 15 words', () => {
    const fifteen =
      'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen';
    const r = CitationSchema.safeParse({
      id: 'hbs-q15',
      type: 'academic',
      publisher: 'Harvard Business School',
      title: 'Fifteen word quote',
      quote: fifteen,
    });
    expect(r.success).toBe(true);
  });

  it('rejects unapproved publisher unless needsVerification', () => {
    const bad = CitationSchema.safeParse({
      id: 'bad-source',
      type: 'academic',
      publisher: 'Some Random Blog',
      title: 'Test',
    });
    expect(bad.success).toBe(false);

    const ok = CitationSchema.safeParse({
      id: 'bad-source',
      type: 'academic',
      publisher: 'Some Random Blog',
      title: 'Test',
      needsVerification: true,
    });
    expect(ok.success).toBe(true);
  });

  it('rejects malformed id (not kebab-case)', () => {
    const r = CitationSchema.safeParse({
      id: 'BadID with spaces',
      type: 'book',
      publisher: 'Case in Point',
      title: 'X',
    });
    expect(r.success).toBe(false);
  });
});
