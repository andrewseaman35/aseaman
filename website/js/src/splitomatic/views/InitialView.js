import React, { useState } from 'react';

import Loading from '../components/Loading';

const InitialView = ({ actions, errorMessage }) => {
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = () => {
    setJoining(true);
    actions.joinEvent({ joinCode });
  };

  if (joining && !errorMessage) {
    return <Loading label="Loading event..." />;
  }

  return (
    <div className="initial-view">

      <div className="initial-view-top">
        <h1 className="splitomatic-title">Splitomatic</h1>
        <button
          onClick={() => actions.navigateToCreate()}
          className="splitomatic-button"
        >
          Create Event
        </button>
      </div>

      <div className="join-event-divider">
        <span>OR</span>
      </div>

      <div className="initial-view-bottom">
        <input
          type="text"
          className="splitomatic-input"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          placeholder="Enter event code"
        />
        <button
          disabled={!joinCode}
          onClick={handleJoin}
          className="splitomatic-button"
        >
          Join Event
        </button>

        {errorMessage && (
          <div className="splitomatic-error-message">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default InitialView;