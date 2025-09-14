import React, { useState, useRef } from 'react';

const Tooltip = ({ children, content, placement = "top", delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delay * 1000);
  };

  const hideTooltip = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span
      className="splitomatic-tooltip-wrapper"
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={0}
    >
      {children}
      {visible && (
        <span
          className={`splitomatic-tooltip splitomatic-tooltip-${placement}`}
          style={{
            position: 'absolute',
            zIndex: 100,
            background: '#333',
            color: '#fff',
            padding: '0.5em 1em',
            borderRadius: '4px',
            fontSize: '0.95em',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            top: placement === "top" ? '-2.5em' : '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: placement === "top" ? '-8px' : '8px',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;