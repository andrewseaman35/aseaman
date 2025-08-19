import React, { useEffect, useState } from 'react';
import { fetchSummary } from '../api';

const SummaryModal = ({ usersById, userId, eventId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchSummary(userId, eventId).then((data) => {
      if (isMounted) {
        setSummary(data);
        console.log(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [userId, eventId]);

  if (loading) {
    return (
      <div className="summary-modal">
        <div className="summary-modal-inner">
          <h3>Status</h3>
          <div className="modal-body-text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="summary-modal">
      <div className="summary-modal-inner">
        <h3>Summary</h3>
        <div className="summary-modal-content">
          {Object.entries(usersById).map(([uid, user]) => (
            <div key={uid} className="summary-user-row" style={{ display: 'flex', marginBottom: '1em' }}>
              <div className="summary-user-name" style={{ flex: 1, fontWeight: 'bold' }}>
                {user.name}
              </div>
              <div className="summary-user-items" style={{ flex: 2 }}>
                {(summary && summary.totals[uid]) ? (
                  Object.entries(summary.totals[uid]).map((value, label) => (
                    <div key={label} className="summary-user-item" style={{ marginBottom: '0.5em' }}>
                      <span className="summary-item-label" style={{ fontWeight: 'bold' }}>{label}:</span>
                      <span className="summary-item-value" style={{ marginLeft: '0.5em' }}>{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="summary-user-item">No items</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="splitomatic-button" onClick={onClose} style={{ marginTop: '2em' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SummaryModal;