import React, { useState } from 'react';

import Tooltip from '../../components/Tooltip';

const ReceiptItemRow = ({ item, userId, onClaim, usersById }) => {
    const [loading, setLoading] = useState(false);
    const claimed = item.claimed_by.includes(userId);
    const claimedByNames = [];
    let claimCount = 0;
    let totalClaims = 0;

    if (item.claimed_by.length > 0) {
        item.claimed_by.map((claimer_id) => {
            if (claimer_id === userId) {
                claimCount += 1;
            }
            totalClaims += 1;
            claimedByNames.push(usersById[claimer_id].name)
        })
    }

    const youOwe = totalClaims > 0 ? (Number(item.total) / totalClaims) * claimCount : 0;
    const claimsByUser =
        claimedByNames.reduce((acc, name) => {
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
    const claimedByText = claimedByNames.length > 0
        ? Object.entries(claimsByUser)
            .sort((a, b) => b[1] - a[1]) // Sort by count descending
            .map(([name, count]) => count > 1 ? `${name} (x${count})` : name)
            .join(', ')
        : "No claims";

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

    const formattedTotal = Number(item.total).toFixed(2);
    const formattedYouOwe = youOwe != 0 ? `You owe: $${youOwe.toFixed(2)}` : "--";
    const claimedTooltipContent = (
        <table style={{
            borderCollapse: 'collapse',
            fontSize: '12px',
            minWidth: '1px',
            background: '#fff',
            color: '#222',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            margin: 0,
            padding: 0,
        }}>
            <thead>
                <tr>
                    <th style={{ padding: '2px 6px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>User</th>
                    <th style={{ padding: '2px 6px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Count</th>
                    <th style={{ padding: '2px 6px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Total</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(claimsByUser).map(([name, count]) => (
                    <tr key={name}>
                        <td style={{ padding: '2px 6px', borderBottom: '1px solid #f5f5f5' }}>{name}</td>
                        <td style={{ padding: '2px 6px', borderBottom: '1px solid #f5f5f5', textAlign: 'center' }}>{count}</td>
                        <td style={{ padding: '2px 6px', borderBottom: '1px solid #f5f5f5', textAlign: 'right' }}>
                            ${totalClaims > 0 ? ((Number(item.total) / totalClaims) * count).toFixed(2) : "0.00"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <tr className="receipt-item-row">
            <td>{item.item_name}</td>
            <td>${formattedTotal}</td>
            <td className="claimed-by-cell" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                        <button
                            className="splitomatic-claim-count-button decrease"
                            disabled={loading || claimCount === 0}
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
                            <div className="splitomatic-claim-count">
                                {claimCount}
                            </div>
                        )}

                        <button
                            className="splitomatic-claim-count-button increase"
                            disabled={loading}
                            onClick={() => handleClaim(true)}
                        >
                            &#43;
                        </button>
                    </div>
                </div>
            </td>
            <td>
                {
                    claimCount > 0 ? (
                        <Tooltip content={claimedTooltipContent}>
                            {formattedYouOwe}
                        </Tooltip>
                    ) : (
                        formattedYouOwe
                    )
                }
            </td>
        </tr>
    )
}

export default ReceiptItemRow;