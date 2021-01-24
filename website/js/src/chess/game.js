import _ from 'lodash';

import {
    SIDE,
    TURN_STATE,
} from './constants';

import Board from './board';

import {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
} from './piece';


const WHITE_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'] },
    { Piece: Rook, startingPositions: ['A1', 'H1'] },
    { Piece: Knight, startingPositions: ['B1', 'G1'] },
    { Piece: Bishop, startingPositions: ['C1', 'F1'] },
    { Piece: Queen, startingPositions: ['D1'] },
    { Piece: King, startingPositions: ['E1'] },
];

const BLACK_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'] },
    { Piece: Rook, startingPositions: ['A8', 'H8'] },
    { Piece: Knight, startingPositions: ['B8', 'G8'] },
    { Piece: Bishop, startingPositions: ['C8', 'F8'] },
    { Piece: Queen, startingPositions: ['D8'] },
    { Piece: King, startingPositions: ['E8'] },
];


class ChessTurn {
    constructor(side) {
        this.side = side;
        this.isCapture = null;

        this.piece = null;
        this.startingSpacePosition = null;
        this.endingSpacePosition = null;
    }

    get pieceNotation() {
        if (this.piece) {
            return this.piece.notation;
        }
        return null;
    }

    get state() {
        if (this.piece === null) {
            return TURN_STATE.EMPTY;
        }
        if (this.endingSpacePosition === null) {
            return TURN_STATE.SELECTED_PIECE;
        }
        return TURN_STATE.COMPLETE;
    }

    unsetStartingPieceSpace() {
        if (!this.isInState(TURN_STATE.SELECTED_PIECE)) {
            throw new Error(`unsetStartingPieceSpace disallowed for state ${this.state}`);
        }
        this.startingSpacePosition = null;
        this.piece = null;
    }

    setStartingPieceSpace(space) {
        if (!this.isInState(TURN_STATE.EMPTY)) {
            throw new Error(`setStartingPieceSpace disallowed for state ${this.state}`);
        }
        this.startingSpacePosition = space.position;
        this.piece = space.piece;
    }

    setEndingPieceSpace(space) {
        if (!this.isInState(TURN_STATE.SELECTED_PIECE)) {
            throw new Error(`setEndingPieceSpace disallowed for state ${this.state}`);
        }
        this.endingSpacePosition = space.position;
        this.isCapture = space.isOccupied && (space.piece.side !== this.side);
    }

    isInState(state) {
        return this.state === state;
    }
}


class ChessGame {
    constructor() {
        this.board = new Board();

        this.whitePieces = this.initializePieces(WHITE_PIECE_SETUP, SIDE.WHITE);
        this.blackPieces = this.initializePieces(BLACK_PIECE_SETUP, SIDE.BLACK);

        this.currentSide = null;
        this.turns = [];

        this.board.setOnSpaceSelectListener(this.onBoardSpaceSelect.bind(this));

        this.board.refreshBoard();

        this.startGame();
        console.log(this);
    }

    initializePieces(pieceSetup, side) {
        const pieces = [];
        _.each(pieceSetup, (pieceSetup) => {
            _.each(pieceSetup.startingPositions, (startingPosition) => {
                const piece = new pieceSetup.Piece(side, startingPosition);
                this.board.setPiece(piece, startingPosition);
                pieces.push(piece);
            });
        });

        return pieces;
    }

    get currentTurn() {
        return this.turns[this.turns.length - 1];
    }

    onBoardSpaceSelect(space) {
        if (this.currentTurn.isInState(TURN_STATE.EMPTY)) {
            if (space.piece) {
                if (space.piece.side === this.currentTurn.side) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space);
                }
            }
        } else if (this.currentTurn.isInState(TURN_STATE.SELECTED_PIECE)) {
            const startingSpace = this.board.spaceByPosition(this.currentTurn.startingSpacePosition);
            if (space.piece && space.piece.side === this.currentTurn.side) {
                const startingPiece = this.currentTurn.startingPiece;
                this.currentTurn.unsetStartingPieceSpace();
                this.board.clearBoardState();
                if (space.piece !== startingPiece) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space);
                }
            } else if (this.currentTurn.piece.getPossibleMoves(this.board, startingSpace).includes(space.position)) {
                this.currentTurn.setEndingPieceSpace(space);
                this.board.executeTurn(this.currentTurn);
                this.board.refreshBoard();

                this.endTurn();
                this.startNextTurn();
            }
        }
    }

    startGame() {
        this.currentSide = SIDE.WHITE;
        this.startNextTurn();
    }

    startNextTurn() {
        this.turns.push(new ChessTurn(this.currentSide));
    }

    endTurn() {
        this.currentSide = this.currentSide === SIDE.WHITE ? SIDE.BLACK : SIDE.WHITE;
    }

}


module.exports = ChessGame;
