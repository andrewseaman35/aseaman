import $ from 'jquery';


class GameInfo {
    constructor() {
        this.container = $('#game-info-container');
    }

    setNote(note) {
        if (note && note.length) {
            $('game-info-note').text(note);
        } else {
            $('game-info-note').empty();
        }
    }

    setCheckmate(winner) {
        $('#game-info-checks').text(`Checkmate! ${winner} wins!`);
    }

    setChecks(checkPositions) {
        if (checkPositions && checkPositions.length) {
            const checkString = checkPositions.join(', ');
            $('#game-info-checks').text(`Check${checkPositions.length > 1 ? 's' : ''} from ${checkString}`);
        } else {
            $('#game-info-checks').empty();
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
