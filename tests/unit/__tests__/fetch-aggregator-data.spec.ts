import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAggregatorData } from '../../../src/helpers/fetch-aggregator-data';

const SRC = 'https://aggregator.pjbuilds.dev/api/v1/meetings';

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(response: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('fetchAggregatorData', () => {
  it('builds a near/radius query and unwraps the data envelope', async () => {
    const fetchMock = mockFetch({ data: [{ slug: 'a' }], links: {}, meta: {} });

    const result = await fetchAggregatorData({
      src: SRC,
      latitude: 33.015,
      longitude: -80.236,
      radius: 10,
    });

    expect(result).toEqual([{ slug: 'a' }]);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('near=33.015%2C-80.236');
    expect(calledUrl).toContain('radius=10');
  });

  it('caps the radius at the API maximum of 50', async () => {
    const fetchMock = mockFetch({ data: [] });

    await fetchAggregatorData({
      src: SRC,
      latitude: 1,
      longitude: 2,
      radius: 100,
    });

    expect(String(fetchMock.mock.calls[0][0])).toContain('radius=50');
  });

  it('drops any query string the site owner included on the src', async () => {
    const fetchMock = mockFetch({ data: [] });

    await fetchAggregatorData({
      src: `${SRC}?program=AA&radius=999`,
      latitude: 1,
      longitude: 2,
      radius: 5,
    });

    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).not.toContain('program=AA');
    expect(calledUrl).toContain('radius=5');
  });

  it('uses the aggregator segment from a comma-separated src', async () => {
    const fetchMock = mockFetch({ data: [] });

    await fetchAggregatorData({
      src: `https://example.org/data.json, ${SRC}`,
      latitude: 1,
      longitude: 2,
      radius: 5,
    });

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      'aggregator.pjbuilds.dev/api/v1/meetings'
    );
  });

  it('rejects on a non-ok response with the status', async () => {
    mockFetch(null, false, 503);

    await expect(
      fetchAggregatorData({ src: SRC, latitude: 1, longitude: 2, radius: 5 })
    ).rejects.toBe(503);
  });

  it('throws when the response is not the expected envelope', async () => {
    mockFetch([{ slug: 'a' }]); // bare array, missing { data }

    await expect(
      fetchAggregatorData({ src: SRC, latitude: 1, longitude: 2, radius: 5 })
    ).rejects.toThrow('data is not in the correct format');
  });

  it('throws when no aggregator endpoint is present in src', async () => {
    mockFetch({ data: [] });

    await expect(
      fetchAggregatorData({
        src: 'https://example.org/data.json',
        latitude: 1,
        longitude: 2,
        radius: 5,
      })
    ).rejects.toThrow('no aggregator endpoint');
  });
});
