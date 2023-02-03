function fullscreenLoadingOverlay(show) {
    const element = document.getElementById('fullscreen-loading-overlay');
    const display = show ? "block" : "none";
    element.style.display = display;
}

module.exports = {
    fullscreenLoadingOverlay,
};