import _ from 'lodash';

import {
    getImageSrc,
} from '../utils';

import {
    SIDE,
    PIECE_NOTATION,
    MOVEMENT_GROUPS,
    MOVE_TYPE,
} from './constants';

import {
    fileFromIndex,
    rankFromIndex,
    fileFromPosition,
    rankFromPosition,
    positionToIndex,
} from './utils';

import Analyzer from './analyzer';


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

    getNormalMoves(board, space) {
        const moves = [];
        const movementPaths = this.getMovementPaths(board, space);
        _.each(movementPaths, (path) => {
            _.each(path, (move) => {
                const newSpacePosition = space.getRelativeSpacePosition(move[0], move[1]);
                if (newSpacePosition) {
                    const newSpace = board.spaceByPosition(newSpacePosition);
                    if (newSpace.isOccupied) {
                        if (this.side !== newSpace.piece.side) {
                            moves.push({
                                position: newSpacePosition,
                                type: MOVE_TYPE.NORMAL,
                            });
                        }
                        return false;
                    }
                }
                moves.push({
                    position: newSpacePosition,
                    type: MOVE_TYPE.NORMAL,
                });
            });
        });

        return moves;
    }

    getPossibleMoves(board, space, previousTurn) {
        const moves = [];
        const specialMoves = this.getSpecialMoves(board, space, previousTurn);
        const normalMoves = this.getNormalMoves(board, space);

        moves.push(...specialMoves, ...normalMoves);
        return _.filter(moves, move => move.position);
    }

    isSamePiece(otherPiece) {
        return this.startingPosition === otherPiece.startingPosition;
    }
}

class Pawn extends Piece {
    constructor(side, startingPosition) {
        super(side, PIECE_NOTATION.PAWN, startingPosition);

        this.isPromoted = false;
    }

    getPossibleMoves(board, space, previousTurn) {
        const possibleMoves = super.getPossibleMoves(board, space, previousTurn);
        const rankBeforePromotion = this.isWhite ? 7 : 2;
        const rankOfPromotion = this.isWhite ? 8 : 1;
        if (rankFromPosition(space.position) === rankBeforePromotion) {
            _.each(possibleMoves, (move) => {
                if (rankFromPosition(move.position) === rankOfPromotion) {
                    move.type = MOVE_TYPE.PROMOTION;
                }
            });
        }
        return possibleMoves;
    }

    getSpecialMoves(board, space, previousTurn) {
        if (previousTurn === null) {
            return [];
        }
        const currentRank = rankFromPosition(space.position);

        // Moving pawn must be on fifth rank
        const fifthRankForSide = this.side === SIDE.WHITE ? 5 : 4;
        if (currentRank !== fifthRankForSide) {
            return [];
        }

        // Previous turn must have had the captured pawn make a double step
        if (previousTurn.piece.notation !== PIECE_NOTATION.PAWN) {
            return [];
        }
        const startingRank = rankFromPosition(previousTurn.startingSpacePosition);
        const endingRank = rankFromPosition(previousTurn.endingSpacePosition);
        if (Math.abs(startingRank - endingRank) !== 2) {
            return [];
        }

        // Captured pawn must be on adjacent file to moving pawn
        const capturedPawnFile = fileFromPosition(previousTurn.endingSpacePosition);
        const adjacentFiles = _.filter([
            fileFromPosition(space.getRelativeSpacePosition(1, 0)),
            fileFromPosition(space.getRelativeSpacePosition(-1, 0)),
        ], space => space !== null);
        if (!adjacentFiles.includes(capturedPawnFile)) {
            return [];
        }

        return [{
            position: `${capturedPawnFile}${currentRank + this.forwardRankIncrement}`,
            type: MOVE_TYPE.EN_PASSANT,
        }];
    }

    getMovementPaths(board, space) {
        const movementPaths = [];

        const forwardPosition = space.getRelativeSpacePosition(...[0, this.forwardRankIncrement]);
        const forwardSpace = forwardPosition ? board.spaceByPosition(forwardPosition) : null;
        if (forwardSpace && !forwardSpace.isOccupied) {
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
            specialMoves.push({
                position: this.side === SIDE.WHITE ? 'G1' : 'G8',
                type: MOVE_TYPE.KINGSIDE_CASTLE,
            });
        }
        if (canCastle.queenside) {
            specialMoves.push({
                position: this.side === SIDE.WHITE ? 'C1' : 'C8',
                type: MOVE_TYPE.QUEENSIDE_CASTLE
            });
        }
        return specialMoves;
    }

    canCastleForFileSpaces(board, rookPosition, intermediatePositions, endingKingPosition) {
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
            // King cannot pass through a space attacked by the opponent.
            // Determining this by moving the king and checking for check.
            const intermediateMove = { position: intermediatePositions[i], type: MOVE_TYPE.NORMAL };
            if (analyzer.willMoveResultInSelfCheck(kingSpace.position, intermediateMove)) {
                return false;
            }
        }
        const endingKingMove = { position: endingKingPosition, type: MOVE_TYPE.NORMAL };
        return !analyzer.willMoveResultInSelfCheck(kingSpace.position, endingKingMove);
    }

    canQueensideFileCastle(board) {
        const queensideRookPosition = this.side === SIDE.WHITE ? 'A1' : 'A8';
        const intermediatePositions = this.side === SIDE.WHITE ? ['B1', 'C1', 'D1'] : ['B8', 'C8', 'D8'];
        const endingKingPosition = this.side === SIDE.WHITE ? 'C1' : 'C8';
        return this.canCastleForFileSpaces(board, queensideRookPosition, intermediatePositions, endingKingPosition);
    }

    canKingsideFileCastle(board) {
        const kingsideRookPosition = this.side === SIDE.WHITE ? 'H1' : 'H8';
        const intermediatePositions = this.side === SIDE.WHITE ? ['F1', 'G1'] : ['F8', 'G8'];
        const endingKingPosition = this.side === SIDE.WHITE ? 'G1' : 'G8';
        return this.canCastleForFileSpaces(board, kingsideRookPosition, intermediatePositions, endingKingPosition);
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
