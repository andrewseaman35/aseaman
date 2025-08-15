import React, { useState } from 'react';

const InitialView = ({ actions }) => {
  const [joinCode, setJoinCode] = useState('');


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
      <button
        style={{
          padding: '1em 2em',
          marginBottom: '2em',
          fontSize: '1.2em',
        }}
        onClick={() => actions.createEvent()}
      >
        Create event
      </button>
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
          onClick={() => actions.joinEvent(joinCode)}
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