import React, { useState, useEffect, useRef } from 'react';

import { calcItemCost } from '../claimUtils';
import { useReceiptItem } from '../hooks/useReceiptItem';

const ReceiptItemCard = ({ item, userId, onClaim, usersById, onUpdate }) => {
    const {
        loading,
        quantity, setQuantity,
        name, setName,
        claimCount, totalClaims, claimedByNames,
        formattedTotal, costPer, formattedYouOwe,
        handleClaim,
    } = useReceiptItem({ item, userId, onClaim, onUpdate });

    const [showBreakdown, setShowBreakdown] = useState(false);
    const [editingCard, setEditingCard] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editQuantity, setEditQuantity] = useState(quantity);

    const popoverRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (!showBreakdown) return;
        const handleOutsideClick = (e) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setShowBreakdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showBreakdown]);

    const handleStartEdit = () => {
        setEditName(name);
        setEditQuantity(quantity);
        setEditingCard(true);
    };

    const handleConfirmEdit = () => {
        const updates = {};
        if (editName !== name) updates.name = editName;
        if (editQuantity !== quantity) updates.quantity = editQuantity;
        if (Object.keys(updates).length > 0) {
            if (updates.name !== undefined) setName(editName);
            if (updates.quantity !== undefined) setQuantity(editQuantity);
            onUpdate(updates);
        }
        setEditingCard(false);
    };

    const handleCancelEdit = () => {
        setEditingCard(false);
    };

    const editCostPer = editQuantity > 0 ? (Number(item.total) / editQuantity).toFixed(2) : "0.00";

    const claimsByUser = claimedByNames.reduce((acc, id) => {
        const userName = usersById[id]?.name || id;
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="receipt-item-card">
            <div className="receipt-item-card-main">
                {editingCard ? (
                    <>
                        <input
                            className="receipt-item-card-name-input"
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                            autoFocus
                        />
                        <div className="receipt-item-card-edit-actions">
                            <button className="receipt-item-card-confirm-btn" onClick={handleConfirmEdit}>✓</button>
                            <button className="receipt-item-card-cancel-btn" onClick={handleCancelEdit}>✗</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="receipt-item-card-name-row">
                            <span className="receipt-item-card-name">{name}</span>
                            <button className="receipt-item-card-edit-btn" onClick={handleStartEdit}>✎</button>
                        </div>
                        <span className="receipt-item-card-cost">${formattedTotal}</span>
                    </>
                )}
            </div>
            <div className="receipt-item-card-meta">
                {editingCard ? (
                    <span className="receipt-item-card-meta-item">
                        Qty: <input
                            className="receipt-item-card-qty-input"
                            type="number"
                            min={1}
                            value={editQuantity}
                            onChange={e => setEditQuantity(Math.max(1, Number(e.target.value)))}
                        />
                    </span>
                ) : (
                    <span className="receipt-item-card-meta-item">Qty: {quantity}</span>
                )}
                <span className="receipt-item-card-meta-item">${editingCard ? editCostPer : costPer} ea</span>
                <span className="receipt-item-card-meta-item">{totalClaims} claims</span>
            </div>
            <div className="receipt-item-card-actions">
                <div className="receipt-item-card-claim-controls">
                    <button
                        className="splitomatic-claim-count-button decrease"
                        disabled={loading || claimCount === 0}
                        onClick={() => handleClaim(false)}
                    >
                        &minus;
                    </button>
                    {loading ? (
                        <div className="splitomatic-loading loading-small" style={{ background: 'none' }}>
                            <div className="splitomatic-loading-icon" />
                        </div>
                    ) : (
                        <span className="splitomatic-claim-count">{claimCount}</span>
                    )}
                    <button
                        className="splitomatic-claim-count-button increase"
                        disabled={loading}
                        onClick={() => handleClaim(true)}
                    >
                        &#43;
                    </button>
                </div>
                <div className="receipt-item-card-you-owe-container">
                    <span className="receipt-item-card-you-owe">{formattedYouOwe}</span>
                    {totalClaims > 0 && (
                        <button
                            ref={buttonRef}
                            className="receipt-item-card-breakdown-btn"
                            onClick={() => setShowBreakdown(prev => !prev)}
                        >
                            ⓘ
                        </button>
                    )}
                    {showBreakdown && (
                        <div ref={popoverRef} className="receipt-item-card-breakdown-popover">
                            <table className="receipt-item-card-breakdown-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Count</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(claimsByUser).map(([userName, count]) => {
                                        const userCost = calcItemCost(item.total, item.quantity, count, totalClaims);
                                        const pct = (userCost / Number(item.total) * 100).toFixed(0);
                                        return (
                                            <tr key={userName}>
                                                <td>{userName}</td>
                                                <td>{count} ({pct}%)</td>
                                                <td>${userCost.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptItemCard;
