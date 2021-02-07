import _ from 'lodash';

import {
    getImageSrc,
} from '../utils';

import {
    SIDE,
    PIECE_NOTATION,
    MOVEMENT_GROUPS,
    SPECIAL_MOVE,
} from './constants';

import {
    fileFromIndex,
    rankFromIndex,
    positionToIndex,
} from './utils';

import Analyzer from './analyzer';
import GameInfo from './gameInfo';


class Piece {
    constructor(side, notation, startingPosition) {
        this.side = side;
        this.notation = notation;

        this.startingPosition = startingPosition;

        this.movementPaths = [];

        this.hasMoved = false;
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

    getSpecialMoves() {
        return [];
    }

    getMovementPaths() {
        return this.movementPaths;
    }

    getAttackedSpacePositions(board, space) {
        // TODO: need to handle special case of pawns only attacking diagonally
        const attackedPositions = [];
        const movementPaths = this.getMovementPaths(board, space);
        _.each(movementPaths, (path) => {
            _.each(path, (move) => {
                const newSpacePosition = space.getRelativeSpacePosition(move[0], move[1]);
                if (newSpacePosition) {
                    const newSpace = board.spaceByPosition(newSpacePosition);
                    if (newSpace.isOccupied) {
                        if (this.side !== newSpace.piece.side) {
                            attackedPositions.push(newSpacePosition);
                        }
                        return false;
                    }
                }
                attackedPositions.push(newSpacePosition);
            });
        });
        return attackedPositions;
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

        return {
            moves: _.filter(moves, move => move !== null),
            special: this.getSpecialMoves(board),
        };
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
        const movementPaths = [];

        const forwardPosition = space.getRelativeSpacePosition(...[0, this.forwardRankIncrement]);
        const forwardSpace = board.spaceByPosition(forwardPosition);
        if (!forwardSpace.isOccupied) {
            movementPaths.push([[0, this.forwardRankIncrement]]);

            if (!this.hasMoved) {
                const startingRankIncrement = 2 * this.forwardRankIncrement;
                const twoSquareMovePosition = space.getRelativeSpacePosition(0, startingRankIncrement);
                const twoSquareMoveSpace = board.spaceByPosition(twoSquareMovePosition);
                if (!twoSquareMoveSpace.isOccupied) {
                    movementPaths[0].push([0, startingRankIncrement]);
                }
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

    getSpecialMoves(board) {
        const canCastle = this.canCastle(board);
        const specialMoves = [];

        if (canCastle.kingside) {
            specialMoves.push(SPECIAL_MOVE.KINGSIDE);
            GameInfo.smallLog('Kingside castle available');
        }
        if (canCastle.queenside) {
            specialMoves.push(SPECIAL_MOVE.QUEENSIDE);
            GameInfo.smallLog('Queenside castle available');
        }
        return specialMoves;
    }

    canCastleForFileSpaces(board, rookPosition, intermediatePositions, endingPosition) {
        const kingSpace = board.getSpaceOfPiece(this);
        const rookSpace = board.spaceByPosition(rookPosition);

        // Rook cannot have moved
        const rook = rookSpace.piece;
        if (!rook || rook.notation !== PIECE_NOTATION.ROOK || rook.hasMoved || rook.side !== this.side) {
            return false;
        }

        const analyzer = new Analyzer();
        analyzer.setup(board);
        for (let i = 0; i < intermediatePositions.length; i += 1) {
            const intermediatePosition = intermediatePositions[i];
            // All spaces between king and rook must be unoccupied
            if (board.spaceByPosition(intermediatePosition).isOccupied) {
                return false;
            }
        }

        // Perform these checks after since they're relatively expensive
        for (let i = 0; i < intermediatePositions.length; i += 1) {
            const intermediatePosition = intermediatePositions[i];
            // King cannot pass through a space attacked by the opponent.
            // Determining this by moving the king and checking for check.
            if (analyzer.willMoveResultInSelfCheck(kingSpace.position, intermediatePosition)) {
                return false;
            }
        }
        return !analyzer.willMoveResultInSelfCheck(kingSpace.position, endingPosition);
    }

    canQueensideFileCastle(board) {
        const queensideRookPosition = this.side === SIDE.WHITE ? 'A1' : 'A8';
        const intermediatePositions = this.side === SIDE.WHITE ? ['B1', 'C1', 'D1'] : ['B8', 'C8', 'D8'];
        const endingPosition = this.side === SIDE.WHITE ? 'C1' : 'C8';
        return this.canCastleForFileSpaces(board, queensideRookPosition, intermediatePositions, endingPosition);
    }

    canKingsideFileCastle(board) {
        const kingsideRookPosition = this.side === SIDE.WHITE ? 'H1' : 'H8';
        const intermediatePositions = this.side === SIDE.WHITE ? ['F1', 'G1'] : ['F8', 'G8'];
        const endingPosition = this.side === SIDE.WHITE ? 'G1' : 'G8';
        return this.canCastleForFileSpaces(board, kingsideRookPosition, intermediatePositions, endingPosition);
    }

    canCastle(board) {
        // King must not have moved
        if (this.hasMoved) {
            return { kingside: false, queenside: false };
        }

        // King cannot be in check
        const analyzer = new Analyzer();
        analyzer.setup(board);
        if (analyzer.isInCheck(this.side)) {
            return { kingside: false, queenside: false };
        }

        // Check if either
        const canQueensideCastle = this.canQueensideFileCastle(board);
        const canKingsideCastle = this.canKingsideFileCastle(board);

        return { kingside: canKingsideCastle, queenside: canQueensideCastle };
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
