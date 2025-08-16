import React, { useState } from 'react';

const SelectUserView = ({ actions, eventId, eventName, users }) => {
  const [selected, setSelected] = useState(users[0] || '');

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
        <h1 style={{ marginBottom: '1.5em', fontSize: '2em', color: '#333' }}>
            Joining Event: {eventName}
        </h1>
        <div>Event id: {eventId}</div>
      <div style={{ width: '300px', marginBottom: '2em' }}>
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '1em' }}>
          Select User
        </label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8em',
            fontSize: '1em',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginBottom: '1em',
          }}
        >
          {users.map((user, idx) => (
            <option key={idx} value={user.id}>{user.name}</option>
          ))}
        </select>
        <button
          style={{
            padding: '1em 2em',
            fontSize: '1.2em',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
          }}
          onClick={() => actions.selectUser(selected)}
          disabled={!selected}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectUserView;