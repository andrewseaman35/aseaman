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
        style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            background: '#f5f5f5',
            position: 'relative',
        }}
    >
        <h1 style={{ marginTop: '2em', fontSize: '2em', color: '#333' }}>Event Home: {`${eventName}`}</h1>
        <div style={{ marginBottom: '1.5em', fontSize: '1.2em', color: '#555' }}>
            Event ID: {eventId}
        </div>
        <div style={{
            width: '350px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: '1em',
            marginBottom: '2em',
        }}>
            <div style={{
                borderBottom: '1px solid #eee',
                paddingBottom: '0.8em',
                marginBottom: '0.8em',
            }}>
                <strong>Logged in as: </strong>
                <div style={{ fontSize: '0.95em', color: '#555' }}>{user.name}</div>
            </div>
        </div>
        <h2 style={{ marginTop: '2em', marginBottom: '1em', fontSize: '1.5em' }}>Receipts</h2>
        <div style={{
            width: '350px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: '1em',
            marginBottom: '2em',
        }}>
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
            <button
                style={{
                    padding: '0.8em 2em',
                    fontSize: '1em',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
                onClick={() => setShowShareModal(true)}
            >
                Share
            </button>
            <button
                style={{
                    padding: '0.8em 2em',
                    fontSize: '1em',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
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

        {showUpload && (
            <div style={{ marginBottom: '2em' }}>
                <input
                    type="file"
                    accept=".js"
                    style={{
                        padding: '0.8em',
                        fontSize: '1em',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                />
            </div>
        )}

        {showShareModal && (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}>
                <div style={{
                    background: 'white',
                    padding: '2em 3em',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    textAlign: 'center',
                }}>
                    <h3 style={{ marginBottom: '1em' }}>Share</h3>
                    <div style={{ marginBottom: '2em', fontSize: '1.1em' }}>Share</div>
                    <button
                        style={{
                            padding: '0.6em 1.5em',
                            fontSize: '1em',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
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