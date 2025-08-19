import React, { useState } from 'react';

const InitialView = ({ actions }) => {
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

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px'}}>
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
    </div>
  );
};

export default InitialView;