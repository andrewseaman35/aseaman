import React, { use, useEffect, useState } from 'react';

import { fetchReceipt } from '../api';

const mockItems = [
  { name: 'Burger', price: 8.99, quantity: 2, total: 17.98, claimed_by: null },
  { name: 'Fries', price: 3.49, quantity: 1, total: 3.49, claimed_by: 'Alice' },
  { name: 'Soda', price: 2.00, quantity: 3, total: 6.00, claimed_by: null },
  { name: 'Salad', price: 5.50, quantity: 1, total: 5.50, claimed_by: 'Bob' },
  { name: 'Pie', price: 4.25, quantity: 2, total: 8.50, claimed_by: null },
];

const mockTaxItems = [
  { label: 'Sales Tax', value: '$2.50' },
  { label: 'Service Fee', value: '$1.00' },
];

const ReceiptDetailView = ({ eventId, receiptsById, receiptId, userId, actions, usersById }) => {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState(null);

  const receipt = receiptsById[receiptId];
  console.log(`Viewing receipt detail for ID: ${receiptId}`);

  useEffect(() => {
    console.log("Fetching receipt with ID: ", receiptId);
    fetchReceipt(eventId, receiptId).then((fetchedReceipt) => {
    if (fetchedReceipt) {
        console.log("Fetched receipt:", fetchedReceipt);
        setItems(fetchedReceipt.items);
    } else {
        console.error("Failed to fetch receipt with ID:", receiptId);
    }
    });
  }, []);


  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
      }}
    >
      <div style={{ marginBottom: '1.5em', width: '350px' }}>
        <div
          style={{
            width: '100%',
            height: '120px',
            background: '#eee',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '1em',
            fontSize: '1.1em',
            color: '#888',
            border: '1px solid #ccc',
          }}
          onClick={() => setShowModal(true)}
        >
            {receipt.presigned_url ? (
                <img
                    src={receipt.presigned_url}
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
              padding: '2em 3em',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              textAlign: 'center',
              minWidth: '300px',
            }}>
                <img
                    src={receipt.presigned_url}
                    alt="Receipt thumbnail"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        display: 'block',
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
                }}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <h3 style={{ marginBottom: '0.5em', fontSize: '1.1em' }}>Items</h3>
        {
            items !== null ? (
                <table style={{
                width: '100%',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                marginBottom: '1.5em',
                borderCollapse: 'collapse',
                }}>
                <thead>
                    <tr style={{ background: '#f0f0f0', fontWeight: 'bold' }}>
                    <td style={{ padding: '0.5em' }}>Name</td>
                    <td style={{ padding: '0.5em' }}>Cost</td>
                    <td style={{ padding: '0.5em' }}>Claims</td>
                    </tr>
                </thead>
                    <tbody>
                        {items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5em' }}>{item.item_name}</td>
                            <td style={{ padding: '0.5em' }}>{item.cost}</td>
                            <td style={{ padding: '0.5em', textAlign: 'center' }}>
                            {item.claimed_by.length > 0
                                ? <span style={{ color: '#007bff', fontWeight: 'bold' }}>{usersById[item.claimed_by].name}</span>
                                : null}
                                <button
                                    style={{
                                        padding: '0.3em 1em',
                                        fontSize: '0.95em',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => actions.claimItem(receiptId, item.id, !item.claimed_by.includes(userId))}
                                >
                                    Claim
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>loading...</div>
            )}

        <h3 style={{ marginBottom: '0.5em', fontSize: '1.1em' }}>Taxes & Fees</h3>
        <table style={{
          width: '100%',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          marginBottom: '2em',
          borderCollapse: 'collapse',
        }}>
          <tbody>
            {mockTaxItems.map((tax, idx) => (
              <tr key={idx} style={{ borderBottom: idx === mockTaxItems.length - 1 ? 'none' : '1px solid #eee' }}>
                <td style={{ padding: '0.5em' }}>{tax.label}</td>
                <td style={{ padding: '0.5em', textAlign: 'right' }}>{tax.value}</td>
              </tr>
            ))}
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