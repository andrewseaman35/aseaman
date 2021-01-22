import _ from 'lodash';

import {
    SIDE,
    PIECE_NOTATION,
} from './constants';

import {
    fileFromIndex,
    rankFromIndex,
    positionToIndex,
    indexToPosition,
} from './utils';


class Piece {
    constructor(side, notation) {
        this.side = side;
        this.notation = notation;
        this.movesIncrements = null;
    }

    getPossibleMoves(space) {
        const moves = [];
        _.each(this.movesIncrements, (moveIncrement) => {
            moves.push(space.getRelativeSpace(moveIncrement[0], moveIncrement[1]));
        });
        return _.filter(moves, move => move !== null);
    }
}

class Pawn extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.PAWN);
        this.movesIncrements = [[0, 1]];
    }

    getPossibleMoves(space) {
        const startingRank = this.side === SIDE.WHITE ? 2 : 7;
        const rank = space.rank;

        const moves = [space.getRelativeSpace(0, 1)];
        if (rank === startingRank) {
            moves.push(space.getRelativeSpace(0, 2));
        }
        return _.filter(moves, move => move !== null);
    }
}
class Knight extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.KNIGHT);
        this.movesIncrements = [[2, 1], [2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2], [-2, -1], [-2, 1]];
    }
}
class Bishop extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.BISHOP);
    }
}
class Rook extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.ROOK);
    }
}
class Queen extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.QUEEN);
    }
}
class King extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.KING);
    }
}


module.exports = {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
};
