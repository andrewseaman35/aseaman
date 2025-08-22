import React, { useState } from 'react';

const InitialView = ({ actions, errorMessage }) => {
  const [joinCode, setJoinCode] = useState('');
  const [eventName, setEventName] = useState('');


  return (
    <div className="initial-view">

      <div className="top-button-container">
        <button
          onClick={() => actions.createEvent({eventName})}
          className="splitomatic-button"
        >
          Create Event
        </button>
      </div>

      <div className="join-event-container">
        <input
          type="text"
          className="splitomatic-input"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          placeholder="Enter event code"
        />
        <button
          disabled={!joinCode}
          onClick={() => actions.joinEvent({ joinCode })}
          className="splitomatic-button"
        >
          Join Event
        </button>
      </div>

      {errorMessage && (
        <div className="splitomatic-error-message" style={{ color: 'red', marginTop: '1em' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default InitialView;