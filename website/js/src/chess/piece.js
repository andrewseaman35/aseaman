import _ from 'lodash';

import {
    SIDE,
    PIECE_NOTATION,
    MOVEMENT_GROUPS,
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
        this.moveIncrements = [];

        this.movementPaths = [];

        this.isWhite = this.side === SIDE.WHITE;
        this.isBlack = !this.isWhite;
    }

    getPossibleMoves(board, space) {
        const moves = [];
        _.each(this.movementPaths, (path) => {
            _.each(path, (move) => {
                const newSpacePosition = space.getRelativeSpacePosition(move[0], move[1]);
                if (newSpacePosition) {
                    const newSpace = board[positionToIndex(newSpacePosition)];
                    if (newSpace.isOccupied) {
                        if (this.side !== newSpace.piece.side) {
                            moves.push(newSpacePosition);
                        }
                        return false;
                    }
                }
                moves.push(newSpacePosition);
            });
        });
        return _.filter(moves, move => move !== null);
    }
}

class Pawn extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.PAWN);
        this.moveIncrements = this.isWhite ? [[0, 1]] : [[0, -1]];
        this.movementPaths = this.isWhite ? [[[0, 1]]] : [[[0, -1]]];
    }

    getPossibleMoves(board, space) {
        const rank = space.rank;
        const moves = [];
        const moveIncrements = [...this.moveIncrements];

        const startingRank = this.isWhite ? 2 : 7;
        if (rank === startingRank) {
            const rankIncrement = this.isWhite ? 2 : -2;
            moveIncrements.push([0, rankIncrement]);
        }
        _.each(moveIncrements, (increment) => {
            moves.push(space.getRelativeSpacePosition(increment[0], increment[1]));
        });

        // TODO: add diagonals for captures
        return _.filter(moves, move => move !== null);
    }
}
class Knight extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.KNIGHT);
        this.movementPaths = [[[2, 1]], [[2, -1]], [[1, 2]], [[-1, 2]], [[1, -2]], [[-1, -2]], [[-2, -1]], [[-2, 1]]];
    }
}
class Bishop extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.BISHOP);
        this.movementPaths = [...MOVEMENT_GROUPS.DIAGONALS];
    }
}
class Rook extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.ROOK);
        this.movementPaths = [...MOVEMENT_GROUPS.SQUARE];
    }
}
class Queen extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.QUEEN);
        this.movementPaths = [
            ...MOVEMENT_GROUPS.SQUARE,
            ...MOVEMENT_GROUPS.DIAGONALS,
        ];
    }
}
class King extends Piece {
    constructor(side) {
        super(side, PIECE_NOTATION.KING);
        this.movementPaths = [[[1, 0]], [[1, 1]], [[0, 1]], [[-1, 1]], [[-1, 0]], [[-1, -1]], [[0, -1]], [[1, -1]]];

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
