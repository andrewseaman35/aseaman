import React, { useState, useEffect } from 'react';

import FileUploader from '../../components/FileUploader';
import ReceiptItem from '../components/ReceiptItem';
import SummaryModal from '../components/SummaryModal';
import Loading from '../components/Loading';
import { fetchSummary, fetchEvent } from '../api'; // Assuming this is the correct path for the API function

const EventHomeView = ({ actions, usersById, eventId, eventName, userId }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  const user = usersById[userId] || { name: 'Unknown User' };
  console.log(`Viewing event home for ID: ${eventName}`);

  useEffect(() => {
    console.log("Fetching event with ID: ", eventId);
    setEvent(null);
    fetchEvent(eventId).then((event) => {
        if (!event || !event.id) {
            console.error("Failed to fetch event");
            return
        }
        console.log("Fetched Event:", event);
        setLastUpdated(Date.now());
        setEvent(event);
        setLoading(false);
    });
  }, [refresh]);

  const triggerRefresh = (showLoading) => {
    console.log("Triggering refresh for event");
    if (showLoading) {
      setLoading(true);
    }
    setRefresh(prev => prev + 1);
  }

  if (loading) {
    return <Loading label="Loading event..." />;
  }

    return (
        <div className="event-home-view">
            <h1>Event Home: {`${event.name}`}</h1>
            <div className="event-home-event-id">
                Event ID: {event.id}
            </div>
            <div className="logged-in-container">
                <div className="logged-in-inner">
                    <strong>Logged in as: </strong>
                    <div className="user-name">{user.name}</div>
                </div>
            </div>

            <h2>Receipts</h2>
            <div className="receipts-container">
                {
                    event.receipts.map((receipt) => (
                        <ReceiptItem
                            name={receipt.name || "Untitled Receipt"}
                            date={receipt.date}
                            status={receipt.status}
                            presignedUrl={receipt.presigned_url}
                            timeCreated={receipt.time_created}
                            uploader="John Doe"
                            viewReceipt={() => actions.viewReceipt(receipt.id)}
                        />
                    ))
                }
            </div>

            <div className="bottom-bar">
                <button className="splitomatic-button"
                    onClick={() => setShowShareModal(true)}
                >
                    Share
                </button>
                <button className="splitomatic-button"
                    onClick={() => setShowStatusModal(true)}
                >
                    Status
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

            {showStatusModal && (
                <SummaryModal
                    usersById={usersById}
                    userId={userId}
                    eventId={eventId}
                    onClose={() => setShowStatusModal(false)}
                />
            )}
        </div>
    );
};

export default EventHomeView;