import React, { use, useEffect, useState } from 'react';

import { fetchReceipt } from '../api';
import ReceiptItemRow from '../components/ReceiptItemRow';
import Loading from '../components/Loading';
import Tooltip from '../../components/Tooltip';


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

  const onUpdateItem = (receiptId, itemId, updates) => {
    console.log(`Updating item with updates: ${JSON.stringify(updates)}`);
    return actions.updateItem(receiptId, itemId, updates).then(() => {
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

  const breakdownInstructions = (
    <span>
      If there are fewer claims than quantity, each claim corresponds to one unit.
      <br/>
      If there are more claims than quantity, the total cost is split evenly among all claimants.
    </span>
  );

  return (
  <div className="splitomatic-receipt-detail-view">
    <div className="last-updated">
      <span className="last-updated-text">
        Last updated: {new Date(lastUpdated).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </span>
      <button className="splitomatic-button" onClick={triggerRefresh}>Refresh</button>
    </div>
    <div className="splitomatic-receipt-detail-main">
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
            <span className="splitomatic-no-image">No Image</span>
          )}
        </div>
      </div>

      {showModal && (
        <div className="splitomatic-modal-overlay">
          <div className="splitomatic-modal-content">
            <img
              src={receipt.presigned_url}
              alt="Receipt thumbnail"
              className="splitomatic-modal-img"
            />
            <button
              className="splitomatic-modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <h3 className="splitomatic-section-title">Items</h3>
      <div className="splitomatic-items-table-container">
        <table className="receipt-item-table">
          <thead>
            <tr>
              <td>Name</td>
              <td>Quantity</td>
              <td>Cost Per</td>
              <td>Cost</td>
              <td>Claims</td>
              <td>
                <Tooltip content={breakdownInstructions}>
                  <span className="splitomatic-breakdown-link">
                    Breakdown
                  </span>
                </Tooltip>
              </td>
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
                  onUpdate={(updates) => onUpdateItem(receiptId, item.id, updates)}
                />
              ))
            }
          </tbody>
        </table>
      </div>

      <h3 className="splitomatic-section-title">Taxes & Fees</h3>
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

      <h3 className="splitomatic-section-title">Summary</h3>
      <table className="splitomatic-summary-table">
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

    <div className="splitomatic-bottom-bar">
      <button className="splitomatic-done-btn">
        I'm done
      </button>
      <button
        className="splitomatic-return-btn"
        onClick={() => actions.returnToEventHome()}
      >
        Return to event
      </button>
    </div>
  </div>
)};

export default ReceiptDetailView;