import { describe, expect, it } from 'vitest';
import { formatDirectionsUrl } from '../../../src/helpers/format-directions-url';
import { Meeting } from '../../../src/types';

describe('formatDirectionsUrl', () => {
  const { formatted_address, latitude, longitude } = {
    formatted_address: 'foo',
    latitude: 1,
    longitude: 1,
  };

  const baseUrl = 'https://www.google.com/maps/dir/?api=1&destination=';
  const iosBaseUrl = 'http://maps.apple.com/?daddr=';

  it.each`
    input                                                                | useLocationName | expectedIos             | expectedGoogle
    ${{ formatted_address }}                                             | ${false}        | ${'foo'}                | ${'foo'}
    ${{ formatted_address, latitude }}                                   | ${false}        | ${'foo'}                | ${'foo'}
    ${{ formatted_address, latitude, longitude }}                        | ${false}        | ${'1%2C1&q=foo'}        | ${'1%2C1'}
    ${{ formatted_address, latitude: 0, longitude: 0 }}                  | ${false}        | ${'0%2C0&q=foo'}        | ${'0%2C0'}
    ${{ formatted_address, location: 'Church', latitude, longitude }}    | ${true}         | ${'Church%2C+foo'}      | ${'Church%2C+foo'}
    ${{ latitude, longitude }}                                           | ${true}         | ${'1%2C1&q=undefined'}  | ${'1%2C1'}
  `(
    'yields $expectedGoogle with $input and useLocationName=$useLocationName',
    ({ input, useLocationName, expectedIos, expectedGoogle }) => {
      //test non-ios
      expect(
        formatDirectionsUrl(input as Meeting, useLocationName)
      ).toStrictEqual(baseUrl + expectedGoogle);

      //change platform to ios - TODO: platform is deprecated
      Object.defineProperty(navigator, 'platform', {
        value: 'iPhone',
        writable: true,
      });

      //test ios
      expect(
        formatDirectionsUrl(input as Meeting, useLocationName)
      ).toStrictEqual(iosBaseUrl + expectedIos);

      //reset
      (navigator as any).platform = undefined;
    }
  );
});
