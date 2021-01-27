import _ from 'lodash';

import {
    PIECE_NOTATION,
    SIDE,
} from './constants';

import ChessTurn from './chessTurn';
import Board from './board';


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

    applyTurns(turns) {
        _.each(turns, (turn) => {
            this.executeTurn(turn);
        });
    }

    restore() {
        _.each(this.spaces, (space) => {
            space.piece = null;
        });
        _.each(this.boardConfiguration, (piece, position) => {
            if (piece) {
                this.setPiece(piece, position);
            }
        });
    }

    findKing(pieces) {
        return _.find(pieces, piece => piece.notation === PIECE_NOTATION.KING);
    }

    findSpacesCausingCheckAgainst(sideInCheck) {
        const sideInCheckPieces = sideInCheck === SIDE.WHITE ? this.whitePieces : this.blackPieces;
        const sideGivingCheckPieces = sideInCheck === SIDE.WHITE ? this.blackPieces : this.whitePieces;

        const checkSpacePositions = [];
        const kingInCheck = this.findPositionOfPiece(this.findKing(sideInCheckPieces));
        _.each(sideGivingCheckPieces, (piece) => {
            if (!piece.isCaptured) {
                const space = this.getSpaceOfPiece(piece);
                if (piece.getPossibleMoves(this, space).includes(kingInCheck)) {
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
    }

    setup(board) {
        this.analyzableBoard.setup(board);
    }

    isInCheck(side) {
        return this.analyzableBoard.findSpacesCausingCheckAgainst(side).length > 0;
    }

    isInCheckmate(side) {
        if (!this.isInCheck(side)) {
            // console.log(`${side} not in checkmate via short circuit`);
            return false;
        }
        const movesToGetOutOfCheck = this.findMovesToGetOutOfCheck(side);
        console.log(`${side} can get out of check with`);
        _.each(movesToGetOutOfCheck, move => {
            console.log(`   ${move[0]} to ${move[1]}`);
        });

        return movesToGetOutOfCheck.length === 0;
    }

    canPutOpponentInCheck(side) {
        const currentSidePieces = side === SIDE.WHITE ? this.analyzableBoard.whitePieces : this.analyzableBoard.blackPieces;
        for (let i = 0; i < currentSidePieces.length; i += 1) {
            const currentSidePiece = currentSidePieces[i];
            if (!currentSidePiece.isCaptured) {
                const currentPieceSpace = this.analyzableBoard.getSpaceOfPiece(currentSidePiece);
                const currentPiecePossibleMoves = currentSidePiece.getPossibleMoves(this.analyzableBoard, currentPieceSpace);
                for (let i = 0; i < currentPiecePossibleMoves.length; i += 1) {
                    const movePosition = currentPiecePossibleMoves[i];
                    const turn = new ChessTurn(currentSidePiece.side);
                    turn.setStartingPieceSpace(this.analyzableBoard.spaceByPosition(currentPieceSpace.position));
                    turn.setEndingPieceSpace(this.analyzableBoard.spaceByPosition(movePosition));
                    this.analyzableBoard.applyTurns([turn]);

                    const checkPositions = this.analyzableBoard.findSpacesCausingCheckAgainst(currentSidePiece.side);
                    if (checkPositions.length) {
                        console.log(`${side} check with ${turn.startingSpacePosition} to ${turn.endingSpacePosition}`);
                        return true;
                    }
                    this.analyzableBoard.restore();
                }
            }
        }
        return false;
    }

    findMovesToGetOutOfCheck(side) {
        const movesToGetOutOfCheck = [];
        const currentSidePieces = side === SIDE.WHITE ? this.analyzableBoard.whitePieces : this.analyzableBoard.blackPieces;
        for (let i = 0; i < currentSidePieces.length; i += 1) {
            const currentSidePiece = currentSidePieces[i];
            if (!currentSidePiece.isCaptured) {
                const currentPieceSpace = this.analyzableBoard.getSpaceOfPiece(currentSidePiece);
                const currentPiecePossibleMoves = currentSidePiece.getPossibleMoves(this.analyzableBoard, currentPieceSpace);
                for (let i = 0; i < currentPiecePossibleMoves.length; i += 1) {
                    const movePosition = currentPiecePossibleMoves[i];
                    const turn = new ChessTurn(currentSidePiece.side);
                    turn.setStartingPieceSpace(this.analyzableBoard.spaceByPosition(currentPieceSpace.position));
                    turn.setEndingPieceSpace(this.analyzableBoard.spaceByPosition(movePosition));
                    this.analyzableBoard.applyTurns([turn]);

                    if (!this.isInCheck(side)) {
                        movesToGetOutOfCheck.push([turn.startingSpacePosition, turn.endingSpacePosition]);
                    }
                    this.analyzableBoard.restore();
                }
            }
        }
        return movesToGetOutOfCheck;
    }

    findSpacesCausingCheckAgainst(sideInCheck) {
        return this.analyzableBoard.findSpacesCausingCheckAgainst(sideInCheck);
    }
}

module.exports = Analyzer;
