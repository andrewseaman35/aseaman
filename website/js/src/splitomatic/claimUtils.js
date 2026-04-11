export function calcItemCost(total, quantity, claimCount, totalClaims) {
    if (claimCount === 0) return 0;
    if (totalClaims <= quantity) {
        return (Number(total) / Number(quantity)) * claimCount;
    } else {
        return (Number(total) / totalClaims) * claimCount;
    }
}
