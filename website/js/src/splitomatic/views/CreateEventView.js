import React, { useState } from 'react';

import SimpleListEntry from '../../components/SimpleListEntry';

const CreateEventView = ({ actions, errorMessage }) => {
  const [userName, setUserName] = useState('');
  const [eventName, setEventName] = useState('');
  const [otherParticipants, setOtherParticipants] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !submitting && userName.trim() && eventName.trim();

  const handleSubmit = () => {
    const others = otherParticipants
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);
    const users = [userName.trim(), ...others];
    setSubmitting(true);
    actions.createEvent({ eventName: eventName.trim(), users }).catch(() => {
      setSubmitting(false);
    });
  };

  return (
    <div className="create-event-view">
      <h1 className="splitomatic-title">Create Event</h1>
      <div className="create-event-view-header">
        <label className="splitomatic-label">Event Name</label>
        <input
          className="splitomatic-input"
          type="text"
          value={eventName}
          onChange={e => setEventName(e.target.value)}
          placeholder="Enter event name"
        />
        <label className="splitomatic-label">Your Name</label>
        <input
          className="splitomatic-input"
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Enter your name"
        />
        <label className="splitomatic-label">Other Participants</label>
        <SimpleListEntry
          value={otherParticipants}
          onUpdate={setOtherParticipants}
          placeholder="Enter names, one per line"
        />
      </div>

      {errorMessage && (
        <div className="splitomatic-error-message">{errorMessage}</div>
      )}

      <div className="create-event-view-actions">
        <button
          className="splitomatic-secondary-button"
          onClick={() => actions.back()}
        >
          Back
        </button>
        <button
          className="splitomatic-button"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Let's go
        </button>
      </div>
    </div>
  );
};

export default CreateEventView;
