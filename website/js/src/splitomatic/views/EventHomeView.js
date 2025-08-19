import React, { useState } from 'react';

import FileUploader from '../../components/FileUploader';
import ReceiptItem from '../components/ReceiptItem';

const EventHomeView = ({ actions, usersById, eventId, eventName, userId, uploadReceipt, receipts }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const user = usersById[userId] || { name: 'Unknown User' };
  console.log(`Viewing event home for ID: ${eventName}`);
  console.log(`Receipts: `, receipts);

return (
    <div
        className="event-home-view"
    >
        <h1>Event Home: {`${eventName}`}</h1>
        <div className="event-home-event-id">
            Event ID: {eventId}
        </div>
        <div
        className="logged-in-container">
            <div
                className="logged-in-inner"
            >
                <strong>Logged in as: </strong>
                <div style={{ fontSize: '0.95em', color: '#555' }}>{user.name}</div>
            </div>
        </div>
        <h2 style={{ marginTop: '2em', marginBottom: '1em', fontSize: '1.5em' }}>Receipts</h2>
        <div className="receipts-container">
            {
                receipts.map((receipt) => (
                    <ReceiptItem
                        name={receipt.name || "Untitled Receipt"}
                        status={receipt.status}
                        presignedUrl={receipt.presigned_url}
                        timeCreated={receipt.time_created}
                        uploader="John Doe"
                        viewReceipt={() => actions.viewReceipt(receipt.id)}
                    />
                ))
            }
        </div>

        <div style={{ display: 'flex', gap: '1em', marginBottom: '2em' }}>
            <button className="splitomatic-button"
                onClick={() => setShowShareModal(true)}
            >
                Share
            </button>
            <button
                className="splitomatic-button"
                onClick={() => actions.reset()}
            >
                Reset
            </button>
            <FileUploader
                inputId="receipt-file"
                upload={(content, filetype) => {actions.uploadReceipt(eventId, content, filetype)}}
                accept="image/png, image/jpeg, application/pdf"
            />
        </div>

        {showShareModal && (
            <div className="share-modal">
                <div className="share-modal-inner">
                    <h3>Share</h3>
                    <div className="modal-body-text" >Share</div>
                    <button
                        className="splitomatic-button"
                        onClick={() => setShowShareModal(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </div>
);
};

export default EventHomeView;