import { useEffect } from 'react';

import { Global } from '@emotion/react';
import { Outlet } from 'react-router-dom';

import {
  DataProvider,
  ErrorProvider,
  FilterProvider,
  InputProvider,
  LocationProvider,
  SettingsProvider,
  useData,
  useError,
  useInput,
  useLocation,
  useSettings,
} from '../hooks';
import { isAggregatorSource } from '../helpers';
import { alertCss, globalCss } from '../styles';

import { Alert, Controls, DynamicHeight, Loading, Map, Table, Title } from './';

export default function TsmlUI({
  google,
  settings: userSettings,
  src,
  timezone,
}: {
  google?: string;
  settings?: TSMLReactConfig;
  src?: string;
  timezone?: string;
}) {
  useEffect(() => {
    console.log(
      'TSML UI meeting finder: https://github.com/code4recovery/tsml-ui'
    );

    // add body class to help people style their pages
    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  const aggregator = isAggregatorSource(src);

  return (
    <ErrorProvider>
      <SettingsProvider userSettings={userSettings}>
        <InputProvider>
          <LocationProvider aggregator={aggregator}>
            <DataProvider
              aggregator={aggregator}
              google={google}
              src={src}
              timezone={timezone}
            >
              <FilterProvider>
                <Global styles={globalCss} />
                <DynamicHeight>
                  <Outlet />
                </DynamicHeight>
              </FilterProvider>
            </DataProvider>
          </LocationProvider>
        </InputProvider>
      </SettingsProvider>
    </ErrorProvider>
  );
}

export const Index = () => {
  const { aggregator, waitingForData } = useData();
  const { error } = useError();
  const { input } = useInput();
  const { latitude, longitude, waitingForLocation } = useLocation();
  const { strings } = useSettings();

  // in aggregator mode, prompt for a location/address until we have coordinates
  // to query with (e.g. when browser geolocation is denied or unavailable)
  const showAggregatorPrompt =
    aggregator && !error && (!latitude || !longitude);

  return waitingForData ? (
    <Loading />
  ) : (
    <>
      <Title />
      <Controls />
      {waitingForLocation ? (
        <Loading />
      ) : (
        <>
          <Alert />
          {showAggregatorPrompt ? (
            <p css={alertCss}>{strings.aggregator_location_prompt}</p>
          ) : input.view === 'map' ? (
            <Map />
          ) : (
            <Table />
          )}
        </>
      )}
    </>
  );
};
