import React from 'react';

const ReceiptItem = ({ name, status, presignedUrl, uploader, viewReceipt, timeCreated }) => {
    const formattedDate = timeCreated
        ? new Date(Number(timeCreated) * 1000).toLocaleString()
        : 'Unknown';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: '1em',
                marginBottom: '1em',
                gap: '1em',
            }}
        >
            <div
                style={{
                    width: '60px',
                    height: '60px',
                    background: '#eee',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                {presignedUrl ? (
                    <img
                        src={presignedUrl}
                        alt="Receipt thumbnail"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            display: 'block',
                        }}
                    />
                ) : (
                    <span style={{ color: '#888', fontSize: '0.9em' }}>No Image</span>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{name}</div>
                <div style={{ fontSize: '0.95em', color: '#555' }}>Status: {status}</div>
                <div style={{ fontSize: '0.95em', color: '#555' }}>Uploader: {uploader}</div>
                <div style={{ fontSize: '0.95em', color: '#555' }}>
                    Created: {formattedDate}
                </div>
                <button
                    style={{
                        padding: '0.6em 1.2em',
                        fontSize: '1em',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                    onClick={viewReceipt}
                >
                    View Receipt
                </button>
            </div>
        </div>
    );
};

export default ReceiptItem;