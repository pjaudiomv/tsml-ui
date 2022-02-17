import React, { useEffect, useState } from 'react';

import '../../public/style.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Alert, Controls, Loading, Map, Meeting, Table, Title } from './';

import {
  filterMeetingData,
  getQueryString,
  loadMeetingData,
  setMinutesNow,
  translateNoCodeAPI,
  setQueryString,
  settings,
} from '../helpers';

export default function TsmlUI({ json, mapbox, timezone }) {
  const [state, setState] = useState({
    alert: null,
    capabilities: {
      coordinates: false,
      distance: false,
      geolocation: false,
      inactive: false,
      location: false,
      region: false,
      time: false,
      type: false,
      weekday: false,
    },
    error: null,
    input: {},
    indexes: {
      distance: [],
      region: [],
      time: [],
      type: [],
      weekday: [],
    },
    loading: true,
    meetings: [],
  });

  //enable forward & back buttons
  useEffect(() => {
    const popstateListener = () => {
      setState({ ...state, input: getQueryString(window.location.search) });
    };
    window.addEventListener('popstate', popstateListener);
    return () => {
      window.removeEventListener('popstate', popstateListener);
    };
  }, [state, window.location.search]);

  //load data once from json
  if (state.loading) {
    const input = getQueryString();

    //fetch json data file and build indexes
    fetch(json)
      .then(result => result.json())
      .then(result => {
        if (json?.includes('nocodeapi.com')) {
          result = translateNoCodeAPI(result);
        }

        if (!Array.isArray(result) || !result.length) {
          return setState({
            ...state,
            error: 'bad_data',
            loading: false,
          });
        }

        const [meetings, indexes, capabilities] = loadMeetingData(
          result,
          state.capabilities,
          timezone
        );

        setState({
          ...state,
          capabilities: capabilities,
          indexes: indexes,
          meetings: meetings,
          loading: false,
          input: input,
        });
      })
      .catch(error => {
        if (json) {
          console.error(error);
        }
        setState({
          ...state,
          error: json ? 'bad_data' : 'no_data_src',
          loading: false,
        });
      });

    return (
      <div className="tsml-ui">
        <Loading />
      </div>
    );
  }

  //apply input changes to query string
  setQueryString(state.input);

  //update time for sorting
  state.meetings = setMinutesNow(state.meetings);

  //filter data
  const [filteredSlugs, inProgress] = filterMeetingData(
    state,
    setState,
    mapbox
  );

  //show alert?
  state.alert = !filteredSlugs.length ? 'no_results' : null;

  //show error?
  if (state.input.meeting && !(state.input.meeting in state.meetings)) {
    state.error = 'not_found';
  }

  return (
    <div className="tsml-ui">
      <div className="container-fluid d-flex flex-column py-3">
        {state.input.meeting && state.input.meeting in state.meetings ? (
          <Meeting
            state={state}
            setState={setState}
            mapbox={mapbox}
            feedback_emails={settings.feedback_emails}
          />
        ) : (
          <>
            {settings.show.title && <Title state={state} />}
            {settings.show.controls && (
              <Controls state={state} setState={setState} mapbox={mapbox} />
            )}
            {(state.alert || state.error) && (
              <Alert state={state} setState={setState} />
            )}
            {filteredSlugs && state.input.view === 'table' && (
              <Table
                state={state}
                setState={setState}
                filteredSlugs={filteredSlugs}
                inProgress={inProgress}
              />
            )}
            {filteredSlugs && state.input.view === 'map' && (
              <Map
                state={state}
                setState={setState}
                filteredSlugs={filteredSlugs}
                mapbox={mapbox}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
