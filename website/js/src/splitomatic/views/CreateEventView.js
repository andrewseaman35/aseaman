import React, { useState } from 'react';

import SimpleListEntry from '../../components/SimpleListEntry';

const CreateEventView = ({ actions }) => {
  const [userName, setUserName] = useState('');
  const [eventName, setEventName] = useState('');
  const [users, setUsers] = useState([]);

  return (
    <div className="create-event-view">
      <div className="create-event-view-header">
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '1em' }}>
          Your Name
        </label>
        <input
          className="splitomatic-input"
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Enter your name"
        />
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '1em' }}>
          Event Name
        </label>
        <input
          className="splitomatic-input"
          type="text"
          value={eventName}
          onChange={e => setEventName(e.target.value)}
          placeholder="Enter event name"
        />
      </div>
      <SimpleListEntry value={users.join('\n')} onUpdate={(e) => {setUsers(e); console.log(e)}} />
      <button
        className="splitomatic-button"
        onClick={() => {actions.createEvent({eventName, users});}}
      >
        Let's go
      </button>
    </div>
  );
};

export default CreateEventView;