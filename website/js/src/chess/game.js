import Board from './board';

import {
    SIDE,
} from './constants';


class ChessGame {
    constructor() {
        this.board = new Board();
        console.log(this.board);

        this.currentTurn = SIDE.WHITE;
    }


}


module.exports = ChessGame;
