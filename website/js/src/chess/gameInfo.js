import $ from 'jquery';
import _ from 'lodash';


class GameInfo {
    constructor() {
        this.container = $('#game-info-container');
    }

    setChecks(checkSpaces) {
        if (checkSpaces && checkSpaces.length) {
            const checkString = _.map(checkSpaces, space => space.position).join(', ');
            $('#game-info-checks').text(`Check${checkSpaces.length > 1 ? 's' : ''} from ${checkString}`);
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
