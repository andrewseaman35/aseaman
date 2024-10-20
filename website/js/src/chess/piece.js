import _ from 'lodash';

import {
    getImageSrc,
} from '../utils';

import {
    SIDE,
    PIECE_NOTATION,
    MOVE_TYPE,
} from './constants';

import {
    fileFromPosition,
    rankFromPosition,
} from './utils';

import Analyzer from './analyzer';


class Piece {
    constructor(side, notation, startingPosition, board) {
        this.side = side;
        this.notation = notation;
        this.setMovementGroups(board);

        this.startingPosition = startingPosition;

        this.movementPaths = [];

        this.hasMoved = false;
        this.isCaptured = false;
        this.isWhite = this.side === SIDE.WHITE;

        this.isPromotedPiece = false;
    }

    get forwardRankIncrement() {
        return this.isWhite ? 1 : -1;
    }

    get imagePath() {
        const imageName = `${this.notation.toLowerCase()}_${this.side.toLowerCase()}`;
        return getImageSrc(`images/chess/pieces/${imageName}.svg`);
    }

    setMovementGroups(board) {
        const movementRanks = Array.from({length: board.numRanks - 1}, (_, i) => i + 1)
        const diagonalSpaces = (board.numFiles > board.numRanks ?
            Array.from({length: board.numFiles - 1}, (_, i) => i + 1) :
            movementRanks
        );

        this.movementGroups = {
            DIAGONALS: [
                diagonalSpaces.map((x) => [x, x]),
                diagonalSpaces.map((x) => [x, -x]),
                diagonalSpaces.map((x) => [-x, x]),
                diagonalSpaces.map((x) => [-x, -x]),
            ],
            SQUARE: [
                movementRanks.map((x) => [0, x]),
                movementRanks.map((x) => [0, -x]),
                movementRanks.map((x) => [x, 0]),
                movementRanks.map((x) => [-x, 0]),
            ],
        };
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
    constructor(side, startingPosition, board) {
        super(side, PIECE_NOTATION.PAWN, startingPosition, board);

        this.hasBeenPromoted = false;
        this.promotedToPiece = null;
    }

    getPossibleMoves(board, space, previousTurn) {
        const possibleMoves = super.getPossibleMoves(board, space, previousTurn);
        const rankBeforePromotion = this.isWhite ? (board.numRanks - 1) : 2;
        const rankOfPromotion = this.isWhite ? board.numRanks : 1;
        if (rankFromPosition(space.position, board.numFiles) === rankBeforePromotion) {
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
        // Previous turn must have had the captured pawn make a double step
        if (previousTurn.piece.notation !== PIECE_NOTATION.PAWN) {
            return [];
        }
        const startingRank = rankFromPosition(previousTurn.startingSpacePosition, board.numFiles);
        const endingRank = rankFromPosition(previousTurn.endingSpacePosition, board.numFiles);
        if (Math.abs(startingRank - endingRank) !== 2) {
            return [];
        }

        // Captured pawn must be on adjacent the same rank as the moving pawn
        const currentRank = rankFromPosition(space.position, board.numFiles);
        const capturedPawnRank = rankFromPosition(previousTurn.endingSpacePosition, board.numFiles);
        if (currentRank !== capturedPawnRank) {
            return [];
        }

        // Captured pawn must be on adjacent file to moving pawn
        const capturedPawnFile = fileFromPosition(previousTurn.endingSpacePosition, board.numFiles);
        const adjacentFiles = _.filter([
            fileFromPosition(space.getRelativeSpacePosition(1, 0), board.numFiles),
            fileFromPosition(space.getRelativeSpacePosition(-1, 0), board.numFiles),
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
    constructor(side, startingPosition, board) {
        super(side, PIECE_NOTATION.KNIGHT, startingPosition, board);
        this.movementPaths = [[[2, 1]], [[2, -1]], [[1, 2]], [[-1, 2]], [[1, -2]], [[-1, -2]], [[-2, -1]], [[-2, 1]]];
    }
}
class Bishop extends Piece {
    constructor(side, startingPosition, board) {
        super(side, PIECE_NOTATION.BISHOP, startingPosition, board);
        this.movementPaths = [...this.movementGroups.DIAGONALS];
    }
}
class Rook extends Piece {
    constructor(side, startingPosition, board) {
        super(side, PIECE_NOTATION.ROOK, startingPosition, board);
        this.movementPaths = [...this.movementGroups.SQUARE];
    }
}
class Queen extends Piece {
    constructor(side, startingPosition, board) {
        super(side, PIECE_NOTATION.QUEEN, startingPosition, board);
        this.movementPaths = [
            ...this.movementGroups.SQUARE,
            ...this.movementGroups.DIAGONALS,
        ];
    }
}
class King extends Piece {
    constructor(side, startingPosition, board) {
        super(side, PIECE_NOTATION.KING, startingPosition, board);
        this.movementPaths = [[[1, 0]], [[1, 1]], [[0, 1]], [[-1, 1]], [[-1, 0]], [[-1, -1]], [[0, -1]], [[1, -1]]];
    }

    getSpecialMoves(board) {
        const canCastle = this.canCastle(board);
        const specialMoves = [];

        if (canCastle.kingside) {
            specialMoves.push({
                position: this.side === SIDE.WHITE ? 'G1' : `G${this.numRanks}`,
                type: MOVE_TYPE.KINGSIDE_CASTLE,
            });
        }
        if (canCastle.queenside) {
            specialMoves.push({
                position: this.side === SIDE.WHITE ? 'C1' : `C${this.numRanks}`,
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

        const analyzer = new Analyzer({
            numRanks: board.numRanks,
            numFiles: board.numFiles,
            fileType: board.fileType,
        });
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
        const maxRank = board.numRanks;
        const queensideRookPosition = board.startPositions[this.side][PIECE_NOTATION.ROOK][0];
        const intermediatePositions = this.side === SIDE.WHITE ? ['B1', 'C1', 'D1'] : [`B${maxRank}`, `C${maxRank}`, `D${maxRank}`];
        const endingKingPosition = this.side === SIDE.WHITE ? 'C1' : `C${maxRank}`;
        return this.canCastleForFileSpaces(board, queensideRookPosition, intermediatePositions, endingKingPosition);
    }

    canKingsideFileCastle(board) {
        const maxRank = board.numRanks;
        const kingsideRookPosition = board.startPositions[this.side][PIECE_NOTATION.ROOK][1];
        const intermediatePositions = this.side === SIDE.WHITE ? ['F1', 'G1'] : [`F${maxRank}`, `G${maxRank}`];
        const endingKingPosition = this.side === SIDE.WHITE ? 'G1' : `G${maxRank}`;
        return this.canCastleForFileSpaces(board, kingsideRookPosition, intermediatePositions, endingKingPosition);
    }

    canCastle(board) {
        // King must not have moved
        if (this.hasMoved) {
            return { kingside: false, queenside: false };
        }

        // King cannot be in check
        const analyzer = new Analyzer({
            numRanks: board.numRanks,
            numFiles: board.numFiles,
            fileType: board.fileType,
        });
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
