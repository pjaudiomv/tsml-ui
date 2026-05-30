import { describe, expect, it } from 'vitest';

import { isAggregatorSource } from '../../../src/helpers/is-aggregator-source';

describe('isAggregatorSource', () => {
  it('matches an aggregator meetings endpoint', () => {
    expect(
      isAggregatorSource('https://aggregator.pjbuilds.dev/api/v1/meetings')
    ).toBe(true);
  });

  it('matches with an existing query string', () => {
    expect(
      isAggregatorSource(
        'https://aggregator.pjbuilds.dev/api/v1/meetings?near=33,-80&radius=10'
      )
    ).toBe(true);
  });

  it('is host-agnostic (self-hosted instances)', () => {
    expect(isAggregatorSource('https://meetings.example.org/api/v1/meetings')).toBe(
      true
    );
  });

  it('matches when one of several comma-separated sources is the aggregator', () => {
    expect(
      isAggregatorSource(
        'https://example.org/data.json, https://aggregator.pjbuilds.dev/api/v1/meetings'
      )
    ).toBe(true);
  });

  it('rejects a static JSON feed', () => {
    expect(isAggregatorSource('https://example.org/meetings.json')).toBe(false);
  });

  it('rejects a Google Sheet source', () => {
    expect(
      isAggregatorSource(
        'https://docs.google.com/spreadsheets/d/abc123/edit'
      )
    ).toBe(false);
  });

  it('returns false for undefined / empty', () => {
    expect(isAggregatorSource(undefined)).toBe(false);
    expect(isAggregatorSource('')).toBe(false);
  });
});
