import _ from 'lodash';

import {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    SIDE,
} from './constants';

import {
    positionToIndex,
    indexToPosition,
} from './utils';

import {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
} from './piece';

import Space from './space';

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


class Board {
    constructor() {
        this.board = _.times(BOARD_WIDTH * BOARD_HEIGHT, i => new Space(i));
        this.whitePieces = this.initializePieces(WHITE_PIECE_SETUP, SIDE.WHITE);
        this.blackPieces = this.initializePieces(BLACK_PIECE_SETUP, SIDE.BLACK);

        this.createDebugBoard();
        this.displayDebugBoard();
    }

    initializePieces(pieceSetup, side) {
        const pieces = [];
        _.each(pieceSetup, (pieceSetup) => {
            _.each(pieceSetup.startingPositions, (startingPosition) => {
                const piece = new pieceSetup.Piece(side);
                this.board[positionToIndex(startingPosition)].setPiece(piece);
                pieces.push(piece);
            });
        });

        return pieces;
    }

    /* Debug board */
    createDebugBoard() {
        const container = document.getElementById('debug-container');
        container.innerHTML = '';

        const table = document.createElement('table');
        table.setAttribute('id', 'debug-table');
        container.appendChild(table);

        let index = 0;
        _.times(BOARD_WIDTH, () => {
            const rank = Math.floor(index / 8) + 1;
            const row = document.createElement('tr');
            row.setAttribute('id', `row-${rank}`);
            _.times(BOARD_HEIGHT, () => {
                const cell = document.createElement('td');
                cell.setAttribute('id', indexToPosition(index));
                row.appendChild(cell);
                index += 1;
            });
            table.prepend(row);
        });

    }

    clearDebugBoard() {
        const container = document.getElementById('debug-container');
        container.innerHTML = '';
    }

    displayDebugBoard() {
        _.each(this.board, (space, index) => {
            const position = indexToPosition(index);
            const boardSpace = document.getElementById(position);
            if (space.piece !== null) {
                boardSpace.innerHTML = `${position}: ${space.piece.notation}`;
            } else {
                boardSpace.innerHTML = position;
            }
        });
    }
}

module.exports = Board;
