import { useState } from 'react';
import { calcItemCost } from '../claimUtils';

export function useReceiptItem({ item, userId, onClaim, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(item.quantity || 1);
    const [editingQuantity, setEditingQuantity] = useState(false);
    const [prevQuantity, setPrevQuantity] = useState(item.quantity || 1);

    const [name, setName] = useState(item.item_name || "");
    const [editingName, setEditingName] = useState(false);
    const [prevName, setPrevName] = useState(item.item_name || "");

    let claimCount = 0;
    let totalClaims = 0;
    const claimedByNames = [];

    for (const claimer_id of item.claimed_by) {
        if (claimer_id === userId) claimCount += 1;
        totalClaims += 1;
        claimedByNames.push(claimer_id);
    }

    const youOwe = calcItemCost(item.total, item.quantity, claimCount, totalClaims);
    const formattedTotal = Number(item.total).toFixed(2);
    const costPer = quantity > 0 ? (Number(item.total) / quantity).toFixed(2) : "0.00";
    const formattedYouOwe = youOwe !== 0 ? `You owe: $${youOwe.toFixed(2)}` : "--";

    const handleClaim = (claim) => {
        setLoading(true);
        onClaim(claim).then(() => {
            setTimeout(() => setLoading(false), 750);
        });
    };

    const handleQuantityChange = (e) => {
        setQuantity(Math.max(1, Number(e.target.value)));
    };

    const handleQuantityBlur = () => {
        setEditingQuantity(false);
        if (quantity === prevQuantity) return;
        const oldQuantity = prevQuantity;
        setPrevQuantity(quantity);
        onUpdate({ quantity }).catch(() => {
            setQuantity(oldQuantity);
            setPrevQuantity(oldQuantity);
        });
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleNameBlur = () => {
        setEditingName(false);
        if (name === prevName) return;
        const oldName = prevName;
        setPrevName(name);
        onUpdate({ name }).catch(() => {
            setName(oldName);
            setPrevName(oldName);
        });
    };

    return {
        loading,
        quantity, setQuantity, editingQuantity, setEditingQuantity,
        name, setName, editingName, setEditingName,
        claimCount, totalClaims, claimedByNames,
        youOwe, formattedTotal, costPer, formattedYouOwe,
        handleClaim, handleQuantityChange, handleQuantityBlur,
        handleNameChange, handleNameBlur,
    };
}
