import _ from 'lodash';

import {
    SIDE,
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
    { Piece: Pawn, startingPositions: ['B2', 'E2', 'F2', 'G2', 'H2'] },
    { Piece: Rook, startingPositions: ['A1', 'H1'] },
    { Piece: Knight, startingPositions: ['B1', 'G1'] },
    { Piece: Bishop, startingPositions: ['C1', 'F1'] },
    { Piece: Queen, startingPositions: ['D1'] },
    { Piece: King, startingPositions: ['E1'] },
];

const BLACK_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'] },
    { Piece: Rook, startingPositions: ['A8', 'H8', 'E3'] },
    { Piece: Knight, startingPositions: ['B8', 'G8'] },
    { Piece: Bishop, startingPositions: ['C8', 'F8'] },
    { Piece: Queen, startingPositions: ['D8'] },
    { Piece: King, startingPositions: ['E8'] },
];


class ChessTurn {
    constructor(side) {
        this.side = side;
        this.isCapture = null;
        this.pieceNotation = null;

        this.startingSpacePostion = null;
        this.endingSpacePosition = null;
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
        console.log(space);
        this.board.displayPossibleMoves(space, space.piece);
    }

    startGame() {
        this.currentSide = SIDE.WHITE;
        this.startTurn();
    }

    startTurn() {
        this.turns.push(new ChessTurn(this.currentSide));
    }

}


module.exports = ChessGame;
