// the c4r-aggregator exposes a location-first meetings endpoint at
// `/api/v1/meetings`. when data-src points there we drive the API by browser
// location / geocoded address instead of loading a whole static feed.
const AGGREGATOR_PATH = /\/api\/v1\/meetings(\?|$|\/)/;

// detect whether any segment of a (possibly comma-separated) src is an
// aggregator endpoint. host-agnostic so self-hosted instances also match.
export function isAggregatorSource(src?: string): boolean {
  return (
    src?.split(',').some(segment => AGGREGATOR_PATH.test(segment.trim())) ??
    false
  );
}
