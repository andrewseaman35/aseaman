import $ from 'jquery';

class GameInfo {
    constructor() {
        this.container = $('#game-info-container');
    }

    setTurn(turn) {
        console.log(turn)
        console.log($('#game-info-turn'));
        if (turn) {
            $('#game-info-turn').text(`Turn: ${turn.side}`);
        } else {
            $('#game-info-turn').text('');
        }
    }
}

module.exports = GameInfo;
