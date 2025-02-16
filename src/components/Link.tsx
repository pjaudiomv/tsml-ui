import { NavLink } from 'react-router-dom';
import { formatUrl, useSettings } from '../helpers';
import type { State, Meeting } from '../types';

type LinkProps = {
  meeting: Meeting;
  setState?: (state: State) => void;
  state?: State;
};

export default function Link({ meeting, setState, state }: LinkProps) {
  const { settings, strings } = useSettings();

  const flags =
    settings.flags
      ?.filter(flag => meeting.types?.includes(flag))
      .map(flag => strings.types[flag])
      .sort()
      .join(', ') ?? [];

  if (!state || !setState) {
    return !flags.length ? (
      <>{meeting.name}</>
    ) : (
      <>
        <span>{meeting.name}</span>
        <small>{flags}</small>
      </>
    );
  }

  return (
    <>
      <NavLink
        to={formatUrl({ ...state.input, meeting: meeting.slug }, settings)}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {meeting.name}
      </NavLink>
      {flags && <small>{flags}</small>}
    </>
  );
}
