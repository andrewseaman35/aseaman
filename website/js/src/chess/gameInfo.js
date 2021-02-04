import $ from 'jquery';


class GameInfo {
    constructor() {
        this.container = $('#game-info-container');
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
            $('#game-info-turn').text(`Turn: ${turn.side}`);
        } else {
            $('#game-info-turn').empty();
        }
    }
}

module.exports = GameInfo;
