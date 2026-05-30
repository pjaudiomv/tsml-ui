import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { AGGREGATOR_MAX_RADIUS, formatString, getDistance } from '../helpers';
import { Index, Meeting } from '../types';

import { useError } from './error';
import { useInput } from './input';
import { useSettings } from './settings';

type LocationState = {
  latitude?: number;
  longitude?: number;
  waitingForLocation: boolean;
};

type LocationContextType = LocationState & {
  calculateDistances: (_meetings: { [index: string]: Meeting }) => {
    meetings: { [index: string]: Meeting };
    distanceIndex: Index[];
    hasDistance: boolean;
  };
  setBounds: (_bounds: {
    north: string;
    south: string;
    east: string;
    west: string;
  }) => void;
};

const defaultLocationState: LocationState = {
  waitingForLocation: false,
};

const LocationContext = createContext<LocationContextType>({
  ...defaultLocationState,
  calculateDistances: () => ({
    meetings: {},
    distanceIndex: [],
    hasDistance: false,
  }),
  setBounds: () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({
  children,
  aggregator,
}: PropsWithChildren<{ aggregator?: boolean }>) => {
  const { setError } = useError();
  const { input } = useInput();
  const { settings, strings } = useSettings();
  const [bounds, setBounds] = useState({
    north: '',
    south: '',
    east: '',
    west: '',
  });

  const [locationState, setLocationState] =
    useState<LocationState>(defaultLocationState);
  const [geocodedSearch, setGeocodedSearch] = useState<string>();
  const attemptedInitialGeolocation = useRef(false);

  // Handle geocoding or geolocation requests
  useEffect(() => {
    // Only proceed if we're in location or me mode
    if (input.mode !== 'location' && input.mode !== 'me') {
      // in aggregator mode the resting "search" state keeps the coordinates
      // obtained from geolocation/geocode so client-side text search filters
      // the already-fetched nearby meetings instead of clearing them
      if (aggregator) {
        setLocationState(prev => ({ ...prev, waitingForLocation: false }));
      } else {
        setLocationState({ waitingForLocation: false });
        setGeocodedSearch(undefined);
      }
      return;
    }

    // Don't re-trigger if we already have coordinates or are already waiting
    if (locationState.waitingForLocation) return;

    setError();

    if (input.mode === 'location' && input.search) {
      // Don't geocode the same search again
      if (geocodedSearch === input.search) return;

      // Wait for bounds to be available before geocoding
      // bounds will be set by DataProvider after meeting data is loaded.
      // in aggregator mode the first geocode happens before any data exists,
      // so skip the wait (the geocoder simply isn't bounds-biased yet)
      if (
        !aggregator &&
        !bounds.north &&
        !bounds.south &&
        !bounds.east &&
        !bounds.west
      ) {
        return;
      }

      setLocationState({ waitingForLocation: true });
      const url = window.location.hostname.endsWith('.test')
        ? 'geo.test'
        : 'geo.code4recovery.org';
      fetch(
        `https://${url}/api/geocode?${new URLSearchParams({
          application: 'tsml-ui',
          language: settings.language,
          referrer: window.location.href,
          search: input.search,
          ...bounds,
        })}`
      )
        .then(result => result.json())
        .then(({ results }) => {
          if (!results?.length) {
            throw new Error(
              formatString(strings.errors.geocoding, { address: input.search })
            );
          }
          const { geometry } = results[0];
          setLocationState({
            latitude: geometry.location.lat,
            longitude: geometry.location.lng,
            waitingForLocation: false,
          });
          setGeocodedSearch(input.search);
        })
        .catch(e => {
          setError(String(e));
          setLocationState({
            latitude: undefined,
            longitude: undefined,
            waitingForLocation: false,
          });
          setGeocodedSearch(input.search);
        });
    } else if (input.mode === 'me') {
      setLocationState({ waitingForLocation: true });
      setError();
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocationState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            waitingForLocation: false,
          });
        },
        err => {
          const { denied, timeout, unavailable } = strings.errors.geolocation;
          setError(
            err.code === err.PERMISSION_DENIED
              ? denied
              : err.code === err.TIMEOUT
                ? timeout
                : unavailable
          );
          setLocationState({
            waitingForLocation: false,
          });
        },
        { timeout: 5000 }
      );
    } else {
      setLocationState({ waitingForLocation: false });
    }
  }, [input.mode, input.search, bounds.north, aggregator]);

  // in aggregator mode, attempt browser geolocation once on load to seed the
  // initial geo query. on denial/failure we silently leave coordinates unset
  // so the UI falls back to the address-search prompt.
  useEffect(() => {
    if (!aggregator || attemptedInitialGeolocation.current) return;
    attemptedInitialGeolocation.current = true;
    // only seed from geolocation in the default resting mode; if the page
    // loaded with an explicit location/me search, the main effect handles it
    if (input.mode !== 'search') return;
    if (!navigator.geolocation) return;
    setLocationState({ waitingForLocation: true });
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocationState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          waitingForLocation: false,
        });
      },
      () => {
        setLocationState({ waitingForLocation: false });
      },
      { timeout: 5000 }
    );
  }, [aggregator, input.mode]);

  const calculateDistances = useCallback(
    (meetings: { [index: string]: Meeting }) => {
      const { latitude, longitude } = locationState;

      if (!latitude || !longitude) {
        return { meetings, distanceIndex: [], hasDistance: false };
      }

      // in aggregator mode the query radius is capped, so don't offer distance
      // options the API can't honor
      const distanceOptions = aggregator
        ? settings.distance_options.filter(
            option => option <= AGGREGATOR_MAX_RADIUS
          )
        : settings.distance_options;

      const distances = Object.fromEntries(
        distanceOptions.map(option => [option, []])
      );

      const updatedMeetings = { ...meetings };

      Object.keys(updatedMeetings).forEach(slug => {
        const meeting = updatedMeetings[slug];
        if (meeting.latitude && meeting.longitude) {
          meeting.distance = getDistance(
            { latitude, longitude },
            meeting,
            settings
          );
        }

        for (const option of distanceOptions) {
          if (meeting.distance && meeting.distance <= option) {
            (distances[option] as string[]).push(meeting.slug);
          }
        }
      });

      const distanceIndex: Index[] = Object.entries(distances).map(
        ([key, slugs]) => ({
          key,
          name: `${key} ${settings.distance_unit}`,
          slugs,
        })
      );

      return {
        meetings: updatedMeetings,
        distanceIndex,
        hasDistance: true,
      };
    },
    [
      aggregator,
      locationState.latitude,
      locationState.longitude,
      settings.distance_options,
      settings.distance_unit,
    ]
  );

  const contextValue: LocationContextType = {
    ...locationState,
    calculateDistances,
    setBounds,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
