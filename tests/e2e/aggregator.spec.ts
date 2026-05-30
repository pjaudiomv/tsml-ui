import { test, expect, type Page } from '@playwright/test';

// aggregator returns Meeting Guide-shaped rows wrapped in a { data } envelope,
// each carrying its own timezone (the fixture sets no data-timezone)
const MEETINGS = [
  {
    id: 1,
    slug: 'summerville-group',
    name: 'Summerville Group',
    day: 0,
    time: '17:30',
    timezone: 'America/New_York',
    formatted_address: '171 Old Parsonage Rd, Summerville, SC 29483, USA',
    location: 'Step-Up Club',
    latitude: 33.0153815,
    longitude: -80.235987,
    types: ['O'],
  },
  {
    id: 2,
    slug: 'charleston-group',
    name: 'Charleston Group',
    day: 3,
    time: '19:00',
    timezone: 'America/New_York',
    formatted_address: '188 Meeting St, Charleston, SC 29401, USA',
    location: 'City Market',
    latitude: 32.7808,
    longitude: -79.9307,
    types: ['C'],
  },
];

async function mockAggregator(page: Page, onRequest?: (url: string) => void) {
  await page.route('http://aggregator.e2e.test/api/v1/meetings**', route => {
    onRequest?.(route.request().url());
    return route.fulfill({ json: { data: MEETINGS, links: {}, meta: {} } });
  });
}

// geocoder used by the address-search fallback (localhost host -> non-.test url)
async function mockGeocoder(page: Page) {
  await page.route('https://geo.code4recovery.org/api/geocode**', route =>
    route.fulfill({
      json: { results: [{ geometry: { location: { lat: 32.78, lng: -79.93 } } }] },
    })
  );
}

const cell = (page: Page, name: string) =>
  page.getByRole('cell', { name, exact: true });

test.describe('aggregator — browser geolocation', () => {
  // geolocation override is reliable in chromium/webkit, not firefox
  test.skip(
    ({ browserName }) => browserName === 'firefox',
    'geolocation override unsupported in firefox'
  );
  test.use({
    permissions: ['geolocation'],
    geolocation: { latitude: 33.015, longitude: -80.236 },
  });

  test('auto-fetches meetings near the detected location', async ({ page }) => {
    let requestedUrl = '';
    await mockAggregator(page, url => (requestedUrl = url));
    await page.goto('/tests/e2e/aggregator-fixture.html');

    await expect(cell(page, 'Summerville Group')).toBeVisible({ timeout: 15000 });
    await expect(cell(page, 'Charleston Group')).toBeVisible();

    expect(requestedUrl).toContain('near=33.015');
    expect(requestedUrl).toMatch(/radius=\d+/);
  });
});

test.describe('aggregator — geolocation unavailable', () => {
  // permission granted but no coordinates provided -> getCurrentPosition errors
  // with POSITION_UNAVAILABLE (reliable across browsers) -> address fallback
  test.use({ permissions: ['geolocation'] });

  test('prompts for an address when location is unavailable', async ({ page }) => {
    await mockAggregator(page);
    await page.goto('/tests/e2e/aggregator-fixture.html');

    // controls render even before any meetings are loaded
    await expect(page.getByRole('searchbox')).toBeVisible({ timeout: 15000 });
    // initial geolocation may take until its timeout to fail on some browsers
    await expect(page.getByText(/search an address/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test('address search geocodes then fetches meetings', async ({ page }) => {
    await mockAggregator(page);
    await mockGeocoder(page);

    // drive the geocode fallback directly via the URL (mode=location + search)
    await page.goto(
      '/tests/e2e/aggregator-fixture.html#/?mode=location&search=Charleston'
    );

    await expect(cell(page, 'Summerville Group')).toBeVisible({ timeout: 15000 });
    await expect(cell(page, 'Charleston Group')).toBeVisible();
  });

  test('distance dropdown omits options above the API radius cap', async ({
    page,
  }) => {
    await mockAggregator(page);
    await mockGeocoder(page);
    await page.goto(
      '/tests/e2e/aggregator-fixture.html#/?mode=location&search=Charleston'
    );
    await expect(cell(page, 'Summerville Group')).toBeVisible({ timeout: 15000 });

    // open the distance dropdown (shown in location mode)
    await page.locator('#distance').click();

    // 50 mi is the cap and must be present; 100 mi must be filtered out
    await expect(page.getByRole('button', { name: /^50 mi/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^100 mi/ })).toHaveCount(0);
  });
});
