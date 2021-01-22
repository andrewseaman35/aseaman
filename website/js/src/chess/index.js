import ChessGame from './game';

function initChess(el) {
    console.log('init chess');
    const game = new ChessGame();
}

module.exports = {
    initChess,
};
