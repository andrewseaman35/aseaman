import React from 'react';

const ReceiptItemRow = ({ item, userId, onClaim, usersById }) => {
    const claimed = item.claimed_by.includes(userId);
    const claimedByNames = item.claimed_by.length > 0 ? item.claimed_by.map((claimer) => usersById[claimer].name).join(', ') : 'No claims';
    return (
        <tr className="receipt-item-row">
            <td>{item.item_name}</td>
            <td>{item.cost}</td>
            <td className="claimed-by-cell">
                <div className="claimed-items">
                    {claimedByNames}
                </div>
                <button
                    className={`splitomatic-button ${claimed ? "unclaim-button" : "claim-button"}`}
                    onClick={() => onClaim(!claimed)}
                >
                    {`${claimed ? "Unclaim" : "Claim"}`}
                </button>
            </td>
        </tr>
    )
}

export default ReceiptItemRow;