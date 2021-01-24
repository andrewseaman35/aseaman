import _ from 'lodash';

import {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    SIDE,
    SPACE_STATE,
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


class Board {
    constructor() {
        this.spaces = _.times(BOARD_WIDTH * BOARD_HEIGHT, i => new Space(i));
        this.createBoard();
    }

    setOnSpaceSelectListener(listener) {
        this.onSpaceSelectListener = listener;
    }

    setPiece(piece, position) {
        const spaceIndex = positionToIndex(position);
        this.spaces[spaceIndex].setPiece(piece);
    }

    onBoardSpaceClick(event) {
        if (this.onSpaceSelectListener) {
            const space = this.spaces[positionToIndex(event.currentTarget.id)];
            this.onSpaceSelectListener(space);
        }
    }

    clearBoardState() {
        _.each(this.spaces, (space) => {
            space.clearState();
        });
    }

    displayPossibleMoves(space) {
        this.clearBoardState();
        const piece = space.piece;
        space.setState(SPACE_STATE.SELECTED);
        if (piece) {
            const possibleMoves = space.piece.getPossibleMoves(this.spaces, space);
            console.log(possibleMoves);
            _.each(possibleMoves, (movePosition) => {
                this.spaces[positionToIndex(movePosition)].setState(SPACE_STATE.SELECTABLE);
            });
        }
    }

    /* Debug board */
    render() {
        this.createBoard();
        this.refreshBoard();
    }

    createBoard() {
        const container = document.getElementById('debug-container');
        container.innerHTML = '';

        const table = document.createElement('table');
        table.setAttribute('id', 'debug-table');
        container.appendChild(table);

        let spaceIndex = 0;
        _.times(BOARD_WIDTH, () => {
            const rank = Math.floor(spaceIndex / 8) + 1;
            const row = document.createElement('tr');
            row.setAttribute('id', `row-${rank}`);
            _.times(BOARD_HEIGHT, () => {
                const cell = document.createElement('td');
                this.spaces[spaceIndex].setCell(cell);
                cell.setAttribute('id', indexToPosition(spaceIndex));
                cell.addEventListener('click', this.onBoardSpaceClick.bind(this));
                row.appendChild(cell);
                spaceIndex += 1;
            });
            table.prepend(row);
        });

    }

    clearDebugBoard() {
        const container = document.getElementById('debug-container');
        container.innerHTML = '';
    }

    refreshBoard() {
        _.each(this.spaces, (space, spaceIndex) => {
            const position = indexToPosition(spaceIndex);
            const boardSpace = document.getElementById(position);
            console.log(space)
            if (space.piece !== null) {
                boardSpace.innerHTML = `${position}: ${space.piece.notation}`;
            } else {
                boardSpace.innerHTML = position;
            }
        });
    }
}

module.exports = Board;