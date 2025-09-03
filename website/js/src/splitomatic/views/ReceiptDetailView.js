import React, { use, useEffect, useState } from 'react';

import { fetchReceipt } from '../api';
import ReceiptItemRow from '../components/ReceiptItemRow';
import Loading from '../components/Loading';


const ReceiptDetailView = ({ eventId, receiptsById, receiptId, userId, actions, usersById }) => {
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  console.log(`Viewing receipt detail for ID: ${receiptId}`);
  console.log("Users by id", usersById)

  useEffect(() => {
    console.log("Fetching receipt with ID: ", receiptId);
    fetchReceipt(eventId, receiptId).then((fetchedReceipt) => {
    if (fetchedReceipt) {
        console.log("Fetched receipt:", fetchedReceipt);
        setReceipt(fetchedReceipt)
        setLastUpdated(Date.now());
        setLoading(false);
    } else {
        console.error("Failed to fetch receipt with ID:", receiptId);
    }
    });
  }, [refresh]);

  const triggerRefresh = (showLoading) => {
    console.log("Triggering refresh for receipt items");
    if (showLoading) {
      setLoading(true);
    }
    setRefresh(prev => prev + 1);
  }

  const onClaimItem = (receiptId, itemId, claim) => {
    console.log(`Claiming item with claim: ${claim}`);
    return actions.claimItem(receiptId, itemId, claim).then(() => {
      triggerRefresh(false);
    });
  }

  if (loading) {
    return <Loading label="Loading receipt..." />;
  }

  console.log(receipt)

  const costsByUserId = {};
  let unclaimedCount = 0;
  let totalCostAccountedFor = 0;
  let totalTotal = 0;
  for (let item of receipt.items) {
    const itemTotal = Number(item.total);
    totalTotal += itemTotal;
    const itemNumSplit = item.claimed_by.length;
    if (itemNumSplit > 0) {
      const pricePerPortion = itemTotal / itemNumSplit;
      for (let claimerUserId of item.claimed_by) {
        if (!(claimerUserId in costsByUserId)) {
          costsByUserId[claimerUserId] = 0;
        }
        costsByUserId[claimerUserId] += pricePerPortion;
        totalCostAccountedFor += pricePerPortion;
      }
    } else {
      unclaimedCount += 1;
    }
  }

  const yourTip = (Number(receipt.tip) / totalTotal) * costsByUserId[userId];
  const yourTax = (Number(receipt.tax) / totalTotal) * costsByUserId[userId];
  const yourTotal = costsByUserId[userId] + yourTip + yourTax;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
      }}
    >
      <div className="last-updated">
        <span className="last-updated-text">
          Last updated: {new Date(lastUpdated).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </span>
        <button className="splitomatic-button" onClick={triggerRefresh}>Refresh</button>
      </div>
      <div style={{ marginBottom: '1.5em', width: '500px' }}>
        <div className="splitomatic-receipt-detail-hero">
          <div className="splitomatic-receipt-detail-hero-details">
            <h2>{receipt.name}</h2>
            <div className="gap"></div>
            <div><strong>Date:</strong> {receipt.date ? new Date(receipt.date).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Payor:</strong> {receipt.payer_user_id && usersById[receipt.payer_user_id] ? usersById[receipt.payer_user_id].name : 'N/A'}</div>
            <div><strong>Uploader:</strong> {receipt.uploader_user_id && usersById[receipt.uploader_user_id] ? usersById[receipt.uploader_user_id].name : 'N/A'}</div>
            <div><strong>Status:</strong> {receipt.status || 'N/A'}</div>
          </div>
          <div
            className="thumbnail-container"
            onClick={() => setShowModal(true)}
          >
            {receipt.presigned_url ? (
              <img
                src={receipt.presigned_url}
                alt="Receipt thumbnail"
              />
            ) : (
              <span style={{ color: '#888', fontSize: '0.9em' }}>No Image</span>
            )}
          </div>
        </div>

        {showModal && (
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
              padding: '2em 3em 1em 3em',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              textAlign: 'center',
              minWidth: '300px',
              maxWidth: '85vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'auto',
            }}>
              <img
                src={receipt.presigned_url}
                alt="Receipt thumbnail"
                style={{
                  maxWidth: '80vw',
                  maxHeight: '70vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  display: 'block',
                  marginBottom: '1em',
                }}
              />
              <button
                style={{
                  padding: '0.6em 1.5em',
                  fontSize: '1em',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  alignSelf: 'center',
                  marginTop: '0.5em',
                }}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <h3 style={{ marginBottom: '0.5em', fontSize: '1.1em' }}>Items</h3>
        <div style={{
          maxHeight: '50vh',
          overflowY: 'auto',
          marginBottom: '1em',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          background: 'white',
        }}>
            <table className="receipt-item-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <td>Name</td>
                  <td>Cost</td>
                  <td>Claims</td>
                  <td>Breakdown</td>
                </tr>
              </thead>
              <tbody>
                {
                  receipt.items.map((item, idx) => (
                    <ReceiptItemRow
                      item={item}
                      userId={userId}
                      key={idx}
                      usersById={usersById}
                      onClaim={(claim) => onClaimItem(receiptId, item.id, claim)}
                    />
                  ))
                }
              </tbody>
            </table>
        </div>

        <h3 style={{ marginBottom: '0.5em', fontSize: '1.1em' }}>Taxes & Fees</h3>
        <table className="receipt-item-table">
          <thead>
            <tr>
              <td>Item</td>
              <td>Total</td>
              <td>Your Portion</td>
            </tr>
          </thead>
          <tbody>
            <tr key="tip" style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5em' }}>Tip</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>${receipt.tip}</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>${yourTip.toFixed(2)}</td>
            </tr>
            <tr key="tax" style={{ borderBottom: 'none' }}>
              <td style={{ padding: '0.5em' }}>Taxes</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>${receipt.tax}</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>${yourTax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ marginBottom: '0.5em', fontSize: '1.1em' }}>Summary</h3>
        <table style={{
          width: '100%',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          marginBottom: '2em',
          borderCollapse: 'collapse',
        }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.5em' }}>Unclaimed Items</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>{unclaimedCount}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5em' }}>Total Cost</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>${receipt.total}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5em' }}>You owe for this receipt</td>
              <td style={{ padding: '0.5em', textAlign: 'right' }}>${yourTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '1em' }}>
        <button
          style={{
            padding: '1em 2em',
            fontSize: '1.2em',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          I'm done
        </button>
        <button
          style={{
            padding: '1em 2em',
            fontSize: '1.2em',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => actions.returnToEventHome()}
        >
          Return to event
        </button>
      </div>
    </div>
  );
};

export default ReceiptDetailView;