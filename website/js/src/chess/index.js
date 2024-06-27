import ChessCoordinator from './coordinator';

function initChess(el) {
    const coordinator = new ChessCoordinator();
    coordinator.initialize();
}

module.exports = {
    initChess,
};
