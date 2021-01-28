import _ from 'lodash';

import {
    getImageSrc,
} from '../utils';

import {
    SIDE,
    PIECE_NOTATION,
    MOVEMENT_GROUPS,
} from './constants';

import {
    fileFromIndex,
    rankFromIndex,
    positionToIndex,
} from './utils';


class Piece {
    constructor(side, notation, startingPosition) {
        this.side = side;
        this.notation = notation;

        this.startingPosition = startingPosition;

        this.movementPaths = [];

        this.isCaptured = false;
        this.isWhite = this.side === SIDE.WHITE;
    }

    get forwardRankIncrement() {
        return this.isWhite ? 1 : -1;
    }

    get startingRank() {
        return rankFromIndex(positionToIndex(this.startingPosition));
    }

    get startingFile() {
        return fileFromIndex(positionToIndex(this.startingPosition));
    }

    get imagePath() {
        const imageName = `${this.notation.toLowerCase()}_${this.side.toLowerCase()}`;
        return getImageSrc(`images/chess/pieces/${imageName}.svg`);
    }

    getMovementPaths() {
        return this.movementPaths;
    }

    getPossibleMoves(board, space) {
        const moves = [];
        const movementPaths = this.getMovementPaths(board, space);
        _.each(movementPaths, (path) => {
            _.each(path, (move) => {
                const newSpacePosition = space.getRelativeSpacePosition(move[0], move[1]);
                if (newSpacePosition) {
                    const newSpace = board.spaceByPosition(newSpacePosition);
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

    isSamePiece(otherPiece) {
        return this.startingPosition === otherPiece.startingPosition;
    }
}

class Pawn extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.PAWN, startingPosition);
    }

    getMovementPaths(board, space) {
        const rank = space.rank;
        const movementPaths = [];

        const forwardPosition = space.getRelativeSpacePosition(...[0, this.forwardRankIncrement]);
        const forwardSpace = board.spaceByPosition(forwardPosition);
        if (!forwardSpace.isOccupied) {
            movementPaths.push([[0, this.forwardRankIncrement]]);

            const startingRankIncrement = 2 * this.forwardRankIncrement;
            const twoSquareMovePosition = space.getRelativeSpacePosition(0, startingRankIncrement);
            const twoSquareMoveSpace = board.spaceByPosition(twoSquareMovePosition);
            if (rank === this.startingRank && !twoSquareMoveSpace.isOccupied) {
                movementPaths[0].push([0, startingRankIncrement]);
            }
        }

        const diagonalIncrements = [[1, this.forwardRankIncrement], [-1, this.forwardRankIncrement]];
        _.map(diagonalIncrements, (increment) => {
            const diagonalPosition = space.getRelativeSpacePosition(...increment);
            if (diagonalPosition) {
                const diagonalSpace = board.spaceByPosition(diagonalPosition);
                if (diagonalSpace.isOccupied && this.side !== diagonalSpace.piece.side) {
                    movementPaths.push([increment]);
                }
            }
        });

        return movementPaths;
    }
}
class Knight extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.KNIGHT, startingPosition);
        this.movementPaths = [[[2, 1]], [[2, -1]], [[1, 2]], [[-1, 2]], [[1, -2]], [[-1, -2]], [[-2, -1]], [[-2, 1]]];
    }
}
class Bishop extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.BISHOP, startingPosition);
        this.movementPaths = [...MOVEMENT_GROUPS.DIAGONALS];
    }
}
class Rook extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.ROOK, startingPosition);
        this.movementPaths = [...MOVEMENT_GROUPS.SQUARE];
    }
}
class Queen extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.QUEEN, startingPosition);
        this.movementPaths = [
            ...MOVEMENT_GROUPS.SQUARE,
            ...MOVEMENT_GROUPS.DIAGONALS,
        ];
    }
}
class King extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.KING, startingPosition);
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
