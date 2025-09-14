import React, { useState } from 'react';

import Tooltip from '../../components/Tooltip';

const ReceiptItemRow = ({ item, userId, onClaim, usersById, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity || 1);
    const [editingQuantity, setEditingQuantity] = useState(false);
    const [prevQuantity, setPrevQuantity] = useState(item.quantity || 1);

    const [name, setName] = useState(item.item_name || "");
    const [editingName, setEditingName] = useState(false);
    const [prevName, setPrevName] = useState(item.item_name || "");

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
            setTimeout(() => {
                setLoading(false);
            }, 750)
        })
    };

    const handleQuantityChange = (e) => {
        const value = Math.max(1, Number(e.target.value));
        setQuantity(value);
    };

    const handleQuantityBlur = async () => {
        setEditingQuantity(false);
        if (quantity === prevQuantity) return;
        const oldQuantity = prevQuantity;
        setPrevQuantity(quantity);

        onUpdate({ quantity }).then(() => {
            // Optionally handle success feedback here
        }).catch(() => {
            setQuantity(oldQuantity);
            setPrevQuantity(oldQuantity);
        });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleNameBlur = async () => {
        setEditingName(false);
        if (name === prevName) return;
        const oldName = prevName;
        setPrevName(name);

        onUpdate({ name }).then(() => {
        }).catch(() => {
            setName(oldName);
            setPrevName(oldName);
        });
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
            <td
                onDoubleClick={() => setEditingName(true)}
                style={{ cursor: 'pointer', minWidth: '10em' }}
            >
                <Tooltip content={item.original_item_name || ""} delay={2}>
                    {editingName ? (
                        <input
                            type="text"
                            value={name}
                            style={{
                                width: '10em',
                                padding: '0.3em',
                                fontSize: '1em',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            autoFocus
                        />
                    ) : (
                        name
                    )}
                </Tooltip>
            </td>
            <td
                onDoubleClick={() => setEditingQuantity(true)}
                style={{ cursor: 'pointer', minWidth: '3em', textAlign: 'center' }}
            >
                <Tooltip content={item.original_quantity != null ? String(item.original_quantity) : ""} delay={2}>
                    {editingQuantity ? (
                        <input
                            type="number"
                            min={1}
                            value={quantity}
                            style={{
                                width: '3em',
                                padding: '0.3em',
                                fontSize: '1em',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                textAlign: 'center'
                            }}
                            onChange={handleQuantityChange}
                            onBlur={handleQuantityBlur}
                            autoFocus
                        />
                    ) : (
                        quantity
                    )}
                </Tooltip>
            </td>
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