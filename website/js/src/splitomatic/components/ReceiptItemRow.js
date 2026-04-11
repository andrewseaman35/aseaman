import React from 'react';

import Tooltip from '../../components/Tooltip';
import { calcItemCost } from '../claimUtils';
import { useReceiptItem } from '../hooks/useReceiptItem';

const ReceiptItemRow = ({ item, userId, onClaim, usersById, onUpdate }) => {
    const {
        loading,
        quantity, editingQuantity, setEditingQuantity,
        name, editingName, setEditingName,
        claimCount, totalClaims, claimedByNames,
        formattedTotal, costPer, formattedYouOwe,
        handleClaim, handleQuantityChange, handleQuantityBlur,
        handleNameChange, handleNameBlur,
    } = useReceiptItem({ item, userId, onClaim, onUpdate });

    const claimsByUser = claimedByNames.reduce((acc, id) => {
        const name = usersById[id]?.name || id;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

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
                            ${calcItemCost(item.total, item.quantity, count, totalClaims).toFixed(2)}
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
                            style={{ width: '10em', padding: '0.3em', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' }}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            autoFocus
                        />
                    ) : name}
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
                            style={{ width: '3em', padding: '0.3em', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                            onChange={handleQuantityChange}
                            onBlur={handleQuantityBlur}
                            autoFocus
                        />
                    ) : quantity}
                </Tooltip>
            </td>
            <td style={{ textAlign: 'right' }}>${costPer}</td>
            <td>${formattedTotal}</td>
            <td className="claimed-by-cell" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
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
                        <div className="splitomatic-claim-count">{claimCount}</div>
                    )}
                    <button
                        className="splitomatic-claim-count-button increase"
                        disabled={loading}
                        onClick={() => handleClaim(true)}
                    >
                        &#43;
                    </button>
                </div>
            </td>
            <td>
                {claimCount > 0 ? (
                    <Tooltip content={claimedTooltipContent} delay={2}>
                        {formattedYouOwe}
                    </Tooltip>
                ) : formattedYouOwe}
            </td>
        </tr>
    );
};

export default ReceiptItemRow;
