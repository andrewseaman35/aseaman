import $ from 'jquery';

import { SIDE } from './constants';



class GameInfo {
    constructor() {
        this.container = $('#game-info-container');

        $('#game-info-promotion-options .promotion-option').on('click', this.handlePromotionOptionClick.bind(this));

        console.log(this);
    }

    setOnPromotionSelectListener(listener) {
        this.onPromotionSelectListener = listener;
    }

    static log(note) {
        if (note && note.length) {
            $('#game-info-note').append(`<span>${note}<br></span>`);
        }
    }

    static smallLog(note) {
        if (note && note.length) {
            $('#game-info-note').append(`<span class="small-log">${note}<br></span>`);
        }
    }

    handlePromotionOptionClick(e) {
        this.onPromotionSelectListener(e);
    }

    displayPromotionOptions(side) {
        const showWhite = side === SIDE.WHITE;
        const whitePieces = $('#game-info-promotion-options img.white');
        const blackPieces = $('#game-info-promotion-options img.black');
        if (showWhite) {
            blackPieces.hide();
            whitePieces.show();
        } else {
            whitePieces.hide();
            blackPieces.show();
        }
    }

    hidePromotionOptions() {
        $('#game-info-promotion-options img').hide();
    }

    setGameId(gameId) {
        $('#game-info-game-id').text(`Game id: ${gameId}`);
    }

    setGameMode(gameMode) {
        $('#game-info-game-mode').text(`Mode: ${gameMode}`);
    }

    setPlayingAs(side) {
        $('#game-info-playing-side').text(`Playing as: ${side}`);
    }

    setOpponent(opponent) {
        if (opponent) {
            $('#game-info-opponent').text(`Opponent: ${opponent}`);
            $('#game-info-opponent').show();
        } else {
            $('#game-info-opponent').hide();
        }
    }

    setNote(note) {
        $('#game-note').empty();
        $('#game-note').append(`<span>${note}</span>`);
    }

    setCheckmate(winner) {
        $('#game-note').text(`Checkmate! ${winner} wins!`);
    }

    setChecks(checkPositions) {
        if (checkPositions && checkPositions.length) {
            const checkString = checkPositions.join(', ');
            $('#game-note').text(`Check${checkPositions.length > 1 ? 's' : ''} from ${checkString}`);
        } else {
            $('#game-note').empty();
        }
    }

    setTurn(turn) {
        if (turn) {
            $('#game-info-turn').text(`Turn: ${turn.side.toLowerCase()}`);
        } else {
            $('#game-info-turn').empty();
        }
    }

    setNetworkPlayState(val) {
        $('#game-info-netplay-state').text(val);
    }
}

module.exports = GameInfo;
