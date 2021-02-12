import _ from 'lodash';

import {
    PIECE_NOTATION,
    SIDE,
} from './constants';

import ChessTurn from './chessTurn';
import Board from './board';
import GameInfo from './gameInfo';


class AnalyzableBoard extends Board {
    constructor() {
        super();
        this.reset();
    }

    reset() {
        this.boardConfiguration = {};
        this.whitePieces = [];
        this.blackPieces = [];
        _.each(this.spaces, (space) => {
            space.piece = null;
        });
    }

    setup(startingBoard) {
        this.reset();
        _.each(startingBoard.spaces, (space) => {
            if (space.piece) {
                // TODO: remove all this cloning and store a serialized piece in boardConfiguration
                const pieceClone = Object.assign(Object.create(Object.getPrototypeOf(space.piece)), space.piece);
                const pieceList = pieceClone.isWhite ? this.whitePieces : this.blackPieces;
                pieceList.push(pieceClone);
                this.boardConfiguration[space.position] = pieceClone;
                this.setPiece(pieceClone, space.position);
            } else {
                this.boardConfiguration[space.position] = null;
            }
        });
    }

    restore() {
        this.whitePieces = [];
        this.blackPieces = [];
        _.each(this.spaces, (space) => {
            space.piece = null;
        });
        _.each(this.boardConfiguration, (piece, position) => {
            if (piece) {
                const pieceClone = Object.assign(Object.create(Object.getPrototypeOf(piece)), piece);
                const pieceList = pieceClone.isWhite ? this.whitePieces : this.blackPieces;
                pieceList.push(pieceClone);
                this.setPiece(pieceClone, position);
            }
        });
    }

    isInCheck(side) {
        return this.findSpacesCausingCheckAgainst(side).length > 0;

    }

    findKing(pieces) {
        return _.find(pieces, piece => piece.notation === PIECE_NOTATION.KING);
    }

    findSpacesCausingCheckAgainst(sideInCheck) {
        const sideInCheckPieces = sideInCheck === SIDE.WHITE ? this.whitePieces : this.blackPieces;
        const sideGivingCheckPieces = sideInCheck === SIDE.WHITE ? this.blackPieces : this.whitePieces;

        const checkSpacePositions = [];
        const kingInCheckPosition = this.findPositionOfPiece(this.findKing(sideInCheckPieces));
        _.each(sideGivingCheckPieces, (piece) => {
            if (!piece.isCaptured) {
                const space = this.getSpaceOfPiece(piece);
                if (piece.getAttackedSpacePositions(this, space).includes(kingInCheckPosition)) {
                    checkSpacePositions.push(space.position);
                }
            }
        });
        return checkSpacePositions;
    }
}


class Analyzer {
    constructor() {
        this.analyzableBoard = new AnalyzableBoard();
        this.reset();
    }

    reset() {
        this._isInCheck = { [SIDE.WHITE]: null, [SIDE.BLACK]: null };
        this._isInCheckmate = { [SIDE.WHITE]: null, [SIDE.BLACK]: null };
        this._movesToGetOutOfCheck = { [SIDE.WHITE]: null, [SIDE.BLACK]: null };
        this._movesToPutOpponentInCheck = { [SIDE.WHITE]: null, [SIDE.BLACK]: null };
    }

    setup(board) {
        this.reset();
        this.analyzableBoard.setup(board);
    }

    isInCheck(side) {
        if (this._isInCheck[side] !== null) {
            return this._isInCheck[side];
        }
        const isInCheck = this.analyzableBoard.findSpacesCausingCheckAgainst(side).length > 0;

        this._isInCheck[side] = isInCheck;
        return this._isInCheck[side];
    }

    isInCheckmate(side, previousTurn) {
        if (this._isInCheckmate[side] !== null) {
            return this._isInCheckmate[side];
        }
        if (!this.isInCheck(side)) {
            this._isInCheckmate[side] = false;
            return this._isInCheckmate[side];
        }
        const movesToGetOutOfCheck = this.movesToGetOutOfCheck(side, previousTurn);
        const isInCheckmate = movesToGetOutOfCheck.length === 0;
        this._isInCheckmate[side] = isInCheckmate;
        return this._isInCheckmate[side];
    }

    willMoveResultInSelfCheck(startPosition, move) {
        const startSpace = this.analyzableBoard.spaceByPosition(startPosition);
        const piece = startSpace.piece;
        const turn = new ChessTurn(piece.side);
        turn.setStartingPieceSpace(this.analyzableBoard.spaceByPosition(startPosition));
        turn.setEndingPieceSpace(this.analyzableBoard.spaceByPosition(move.position));
        turn.setType(move.type);
        this.analyzableBoard.applyTurns([turn]);

        let result = false;
        if (this.analyzableBoard.isInCheck(piece.side)) {
            result = true;
        }
        this.analyzableBoard.restore();
        return result;

    }

    movesToPutOpponentInCheck(side) {
        // this is out of date, but unused for now
        if (this._movesToPutOpponentInCheck[side] !== null) {
            return this._movesToPutOpponentInCheck[side];
        }
        const movesToPutOpponentInCheck = [];
        const currentSidePieces = side === SIDE.WHITE ? this.analyzableBoard.whitePieces : this.analyzableBoard.blackPieces;
        for (let i = 0; i < currentSidePieces.length; i += 1) {
            const currentSidePiece = currentSidePieces[i];
            if (!currentSidePiece.isCaptured) {
                const currentPieceSpace = this.analyzableBoard.getSpaceOfPiece(currentSidePiece);
                const currentPiecePossibleMoves = currentSidePiece.getPossibleMoves(this.analyzableBoard, currentPieceSpace).moves;
                _.each(currentPiecePossibleMoves, (move) => {
                    const turn = new ChessTurn(currentSidePiece.side);
                    turn.setStartingPieceSpace(this.analyzableBoard.spaceByPosition(currentPieceSpace.position));
                    turn.setEndingPieceSpace(this.analyzableBoard.spaceByPosition(move.position));
                    turn.setType(move.type);
                    this.analyzableBoard.applyTurns([turn]);

                    const checkPositions = this.analyzableBoard.findSpacesCausingCheckAgainst(currentSidePiece.side);
                    if (checkPositions.length) {
                        GameInfo.smallLog(`Threat: ${turn.startingSpacePosition} to ${turn.endingSpacePosition}`);
                        movesToPutOpponentInCheck.push([turn.startingSpacePosition, turn.endingSpacePosition]);
                    }
                    this.analyzableBoard.restore();
                });
            }
        }
        this._movesToPutOpponentInCheck[side] = movesToPutOpponentInCheck;
        return this._movesToPutOpponentInCheck[side];
    }

    movesToGetOutOfCheck(side, previousTurn) {
        if (this._movesToGetOutOfCheck[side] !== null) {
            return this._movesToGetOutOfCheck[side];
        }
        const movesToGetOutOfCheck = [];
        const currentSidePieces = side === SIDE.WHITE ? this.analyzableBoard.whitePieces : this.analyzableBoard.blackPieces;
        _.each(currentSidePieces, (currentSidePiece) => {
            if (!currentSidePiece.isCaptured) {
                const currentPieceSpace = this.analyzableBoard.getSpaceOfPiece(currentSidePiece);
                const currentPiecePossibleMoves = currentSidePiece.getPossibleMoves(this.analyzableBoard, currentPieceSpace, previousTurn);

                _.each(currentPiecePossibleMoves, (move) => {
                    const turn = new ChessTurn(currentSidePiece.side);
                    turn.setStartingPieceSpace(this.analyzableBoard.spaceByPosition(currentPieceSpace.position));
                    turn.setEndingPieceSpace(this.analyzableBoard.spaceByPosition(move.position));
                    turn.setType(move.type);

                    this.analyzableBoard.applyTurns([turn]);
                    if (!this.analyzableBoard.isInCheck(side)) {
                        movesToGetOutOfCheck.push([turn.startingSpacePosition, turn.endingSpacePosition]);
                    }
                    this.analyzableBoard.restore();
                });
            }
        });

        this._movesToGetOutOfCheck[side] = movesToGetOutOfCheck;
        return this._movesToGetOutOfCheck[side];
    }

    findSpacesCausingCheckAgainst(sideInCheck) {
        return this.analyzableBoard.findSpacesCausingCheckAgainst(sideInCheck);
    }
}

module.exports = Analyzer;
