import React, { useState } from 'react';

import SimpleListEntry from '../../components/SimpleListEntry';

const CreateEventView = ({ actions }) => {
  const [userName, setUserName] = useState('');
  const [eventName, setEventName] = useState('');
  const [users, setUsers] = useState([]);

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
      <div style={{ marginBottom: '1.5em', width: '300px' }}>
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '1em' }}>
          Your Name
        </label>
        <input
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Enter your name"
          style={{
            width: '100%',
            padding: '0.8em',
            fontSize: '1em',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginBottom: '1em',
          }}
        />
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '1em' }}>
          Event Name
        </label>
        <input
          type="text"
          value={eventName}
          onChange={e => setEventName(e.target.value)}
          placeholder="Enter event name"
          style={{
            width: '100%',
            padding: '0.8em',
            fontSize: '1em',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>
      <SimpleListEntry value={users.join('\n')} onUpdate={(e) => {setUsers(e); console.log(e)}} />
      <button
        style={{
          padding: '1em 2em',
          fontSize: '1.2em',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => {actions.createEvent({eventName, users});}}
      >
        Let's go
      </button>
    </div>
  );
};

export default CreateEventView;