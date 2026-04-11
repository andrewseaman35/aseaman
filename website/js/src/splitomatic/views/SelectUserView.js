import React, { useState } from 'react';

const ADD_USER_VALUE = '__add_user__';

const SelectUserView = ({ actions, eventId, eventName, users }) => {
  const [selected, setSelected] = useState(users[0]?.id || '');
  const [addingUser, setAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSelectChange = (e) => {
    if (e.target.value === ADD_USER_VALUE) {
      setAddingUser(true);
      setSelected('');
    } else {
      setSelected(e.target.value);
      setAddingUser(false);
    }
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    setSaving(true);
    actions.addUser(eventId, newUserName.trim()).then((newUser) => {
      setSelected(newUser.id);
      setAddingUser(false);
      setNewUserName('');
      setSaving(false);
    }).catch(() => {
      setSaving(false);
    });
  };

  return (
    <div className="select-user-view">
      <h1 className="splitomatic-title">Joining Event: {eventName}</h1>
      <div className="select-user-event-id">Event ID: {eventId}</div>
      <div className="select-user-view-header">
        <label className="splitomatic-label" htmlFor="user-select">
          Select User
        </label>
        <select
          id="user-select"
          className="splitomatic-input"
          value={addingUser ? ADD_USER_VALUE : selected}
          onChange={handleSelectChange}
        >
          {users.map((user, idx) => (
            <option key={idx} value={user.id}>{user.name}</option>
          ))}
          <option value={ADD_USER_VALUE}>+ Add User</option>
        </select>

        {addingUser && (
          <div className="select-user-add-user">
            <input
              className="splitomatic-input"
              type="text"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              placeholder="Enter name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddUser()}
            />
            <button
              className="splitomatic-button"
              style={{ width: '100%' }}
              onClick={handleAddUser}
              disabled={!newUserName.trim() || saving}
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        )}
      </div>
      <div className="select-user-view-actions">
        <button
          className="splitomatic-secondary-button"
          onClick={() => actions.back()}
        >
          Back
        </button>
        <button
          className="splitomatic-button"
          onClick={() => actions.selectUser(selected)}
          disabled={!selected || addingUser}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectUserView;
