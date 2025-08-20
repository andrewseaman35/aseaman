import React from 'react';

const ReceiptItem = ({ name, status, presignedUrl, uploader, viewReceipt, timeCreated }) => {
    const formattedDate = timeCreated
        ? new Date(Number(timeCreated) * 1000).toLocaleString()
        : 'Unknown';

    return (
        <div className="receipt-item">
            <div className="image-container">
                {presignedUrl ? (
                    <img src={presignedUrl} alt="Receipt thumbnail" />
                ) : (
                    <span className="no-image">No Image</span>
                )}
            </div>
            <div className="detail-container">
                <div className="name">{name}</div>
                <div className="detail">Status: {status}</div>
                <div className="detail">Uploader: {uploader}</div>
                <div className="detail">Created: {formattedDate}</div>
                {status === "PROCESSED" && <button className="view-receipt-button" onClick={viewReceipt}>
                    View Receipt
                </button>}
            </div>
        </div>
    );
};

export default ReceiptItem;