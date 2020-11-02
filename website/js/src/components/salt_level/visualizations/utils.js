const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDayTimestampLabel(timestamp) {
    const date = new Date(timestamp * 1000);
    const month = SHORT_MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}`;
}

module.exports = {
    formatDayTimestampLabel,
};
