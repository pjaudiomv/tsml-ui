import { isAggregatorSource } from './is-aggregator-source';

import type { JSONData } from '../types';

// the aggregator caps radius at 50 miles (see /api/openapi.json)
export const AGGREGATOR_MAX_RADIUS = 50;

// fetch meetings from the c4r-aggregator near a point. unlike a static feed,
// this is location-first: it requires coordinates and returns only nearby
// meetings, wrapped in a { data, links, meta } envelope.
export async function fetchAggregatorData({
  src,
  latitude,
  longitude,
  radius,
}: {
  src: string;
  latitude: number;
  longitude: number;
  radius: number;
}): Promise<JSONData[]> {
  // use the first src segment that is actually an aggregator endpoint, and
  // drop any query string the site owner included — we set near/radius below.
  const base = src
    .split(',')
    .map(segment => segment.trim())
    .find(segment => isAggregatorSource(segment));

  if (!base) {
    throw new Error('no aggregator endpoint found in data source');
  }

  const url = new URL(base.split('?')[0]);
  url.search = new URLSearchParams({
    near: `${latitude},${longitude}`,
    radius: String(Math.min(radius, AGGREGATOR_MAX_RADIUS)),
  }).toString();

  const res = await fetch(url);
  if (!res.ok) {
    return Promise.reject(res.status);
  }

  const json = await res.json();

  // TODO: follow links.next for >500 results (first page only for now)
  if (!json || !Array.isArray(json.data)) {
    throw new Error('data is not in the correct format');
  }

  return json.data;
}
