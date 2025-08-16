import React from 'react';

const SimpleListEntry = ({ value = '', onUpdate }) => {
  const handleChange = (e) => {
    const lines = e.target.value.split('\n');
    onUpdate(lines);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      rows={6}
      style={{
        width: '100%',
        padding: '0.8em',
        fontSize: '1em',
        borderRadius: '4px',
        border: '1px solid #ccc',
        resize: 'vertical',
      }}
      placeholder="Enter items, one per line"
    />
  );
};

export default SimpleListEntry;