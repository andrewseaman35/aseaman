import React from 'react';

const SimpleListEntry = ({ value = '', onUpdate, placeholder = 'Enter items, one per line' }) => {
  return (
    <textarea
      value={value}
      onChange={e => onUpdate(e.target.value)}
      rows={6}
      style={{
        width: '100%',
        padding: '0.8em',
        fontSize: '1em',
        borderRadius: '4px',
        border: '1px solid #ccc',
        resize: 'vertical',
      }}
      placeholder={placeholder}
    />
  );
};

export default SimpleListEntry;
