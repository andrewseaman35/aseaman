import React, { useState } from 'react';

const InitialView = ({ actions }) => {
  const [joinCode, setJoinCode] = useState('');
  const [eventName, setEventName] = useState('');


  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
      }}
    >

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => actions.createEvent({eventName})}
          style={{
            padding: '0.8em 2em',
            fontSize: '1em',
            background: !eventName ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !eventName ? 'not-allowed' : 'pointer',
          }}
        >
          Create Event
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px'}}>
        <input
          type="text"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          placeholder="Enter event code"
          style={{
            padding: '0.8em',
            fontSize: '1em',
            marginRight: '1em',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          disabled={!joinCode}
          onClick={() => actions.joinEvent({ joinCode })}
          style={{
            padding: '0.8em 2em',
            fontSize: '1em',
            background: !joinCode ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !joinCode ? 'not-allowed' : 'pointer',
          }}
        >
          Join Event
        </button>
      </div>
    </div>
  );
};

export default InitialView;