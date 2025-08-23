import React, { useState } from 'react';

const ReceiptItemRow = ({ item, userId, onClaim, usersById }) => {
    const [loading, setLoading] = useState(false);
    const claimed = item.claimed_by.includes(userId);
    const claimedByNames = [];
    let claimCount = 0;

    if (item.claimed_by.length > 0) {
        item.claimed_by.map((claimer_id) => {
            if (claimer_id === userId) {
                claimCount += 1;
            }
            claimedByNames.push(usersById[claimer_id].name)
        })
    }
    const claimedByText = claimedByNames.length > 0 ? claimedByNames.join(', ') : "No claims";

    const handleClaim = async (claim) => {
        setLoading(true);
        onClaim(claim).then(() => {
            console.log("Unloading")
            // lmao
            setTimeout(() => {
                setLoading(false);
            }, 750)
        })
    };

    return (
        <tr className="receipt-item-row">
            <td>{item.item_name}</td>
            <td>{item.cost}</td>
            <td className="claimed-by-cell" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '4px 0' }}>
                        <span><strong>Claimed:</strong> {claimedByText}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                        <button
                            disabled={loading}
                            style={{
                                backgroundColor: '#e74c3c', // red
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 12px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleClaim(false)}
                        >
                            &minus;
                        </button>

                        {loading ? (
                            <div className="splitomatic-loading loading-small"
                                style={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                }}
                            >
                                <div className="splitomatic-loading-icon" />
                            </div>
                        ) : (
                            <div>
                                {claimCount}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            style={{
                                backgroundColor: '#27ae60', // green
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 12px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleClaim(true)}
                        >
                            &#43;
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    )
}

export default ReceiptItemRow;