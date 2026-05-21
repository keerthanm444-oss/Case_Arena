import { describe, it, expect } from 'vitest';
import { buildEvent } from '@/lib/event-bus/bus';

describe('event bus — buildEvent', () => {
  it('builds a case.opened event with the correct shape', () => {
    const e = buildEvent('case.opened', { caseSlug: 'electrolight' });
    expect(e.kind).toBe('case.opened');
    expect(e.payload.caseSlug).toBe('electrolight');
    expect(typeof e.at).toBe('string');
  });

  it('builds a drill.completed event with a numeric score', () => {
    const e = buildEvent('drill.completed', {
      drillId: 'mm-1',
      score: 0.82,
      durationSec: 45,
    });
    if (e.kind === 'drill.completed') {
      expect(e.payload.score).toBeCloseTo(0.82);
      expect(e.payload.durationSec).toBe(45);
    } else {
      throw new Error('discriminated union narrowing failed');
    }
  });

  it('emits an ISO-parseable timestamp', () => {
    const e = buildEvent('palette.opened', {});
    expect(() => new Date(e.at).toISOString()).not.toThrow();
  });
});
