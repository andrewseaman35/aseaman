import $ from 'jquery';
import _ from 'lodash';

import {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    SPACE_STATE,
} from './constants';

import {
    determineSpaceColor,
    positionToIndex,
    indexToPosition,
    fileFromIndex,
} from './utils';

import Space from './space';


class Board {
    constructor() {
        this.spaces = _.times(BOARD_WIDTH * BOARD_HEIGHT, i => new Space(i));
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
            const space = this.spaceByPosition(event.currentTarget.id);
            this.onSpaceSelectListener(space);
        }
    }

    spaceByPosition(position) {
        return this.spaces[positionToIndex(position)];
    }

    spaceByIndex(index) {
        return this.spaces[index];
    }

    getSpaceOfPiece(piece) {
        const space = _.find(this.spaces, space => space.piece === piece);
        if (space) {
            return space;
        }
        return null;
    }

    findPositionOfPiece(piece) {
        const space = this.getSpaceOfPiece(piece);
        if (space) {
            return space.position;
        }
        return null;
    }

    validateTurn(turn) {
        const startingSpace = this.spaceByPosition(turn.startingSpacePosition);
        const endingSpace = this.spaceByPosition(turn.endingSpacePosition);
        if (startingSpace.piece !== turn.piece) {
            throw new Error(`validateTurn failed on piece validation: ${startingSpace.piece} !== ${turn.piece}`);
        }
        if (turn.isCapture) {
            if (endingSpace.piece === null) {
                throw new Error('no piece on ending space during capture');
            }
            if (endingSpace.piece.side === startingSpace.piece.side) {
                throw new Error('capture applied to own piece');
            }
        }
    }

    executeTurn(turn) {
        const startingSpace = this.spaceByPosition(turn.startingSpacePosition);
        const endingSpace = this.spaceByPosition(turn.endingSpacePosition);
        const piece = startingSpace.piece;

        if (turn.isCapture) {
            endingSpace.piece.isCaptured = true;
        }
        startingSpace.piece = null;
        endingSpace.piece = piece;
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
            const possibleMoves = space.piece.getPossibleMoves(this, space);
            console.log(possibleMoves);
            _.each(possibleMoves, (movePosition) => {
                this.spaces[positionToIndex(movePosition)].setState(SPACE_STATE.POSSIBLE_MOVE);
            });
        }
    }

    /* Debug board */
    render() {
        this.initializeBoard();
        this.refreshBoard();
    }

    initializeBoard() {
        const container = $('#board-container');
        container.empty();

        const table = $('<table></table>').attr('id', 'debug-table');
        container.append(table);

        let spaceIndex = 0;
        _.times(BOARD_WIDTH, () => {
            const rank = Math.floor(spaceIndex / 8) + 1;
            const row = $('<tr></tr>').attr('id', `row-${rank}`);

            const rankLabelCell = $(`<td>${rank}</td>`)
                .attr('class', 'board-label rank');
            row.append(rankLabelCell);

            _.times(BOARD_HEIGHT, () => {
                const position = indexToPosition(spaceIndex);
                const cell = $('<td></td>')
                    .attr('id', position)
                    .attr('class', `space ${determineSpaceColor(position)}`);
                this.spaces[spaceIndex].setCell(cell);
                cell.on('click', this.onBoardSpaceClick.bind(this));
                row.append(cell);
                spaceIndex += 1;
            });
            table.prepend(row);
        });
        const fileLabelRow = $('<tr></tr>').attr('id', 'row-file-label');
        fileLabelRow.append($('<td></td>').attr('class', 'board-label empty'));
        _.times(BOARD_WIDTH, (i) => {
            const fileLabelCell = $(`<td>${fileFromIndex(i)}</td>`)
                .attr('class', 'board-label file');
            fileLabelRow.append(fileLabelCell);
        });
        table.append(fileLabelRow);

    }

    refreshBoard() {
        this.clearBoardState();
        _.each(this.spaces, (space, spaceIndex) => {
            const position = indexToPosition(spaceIndex);
            const boardSpace = $(`#${position}`);
            if (space.piece !== null) {
                if (boardSpace.find('img').attr('src') !== space.piece.imagePath) {
                    boardSpace.html(`<img class="piece-image" src=${space.piece.imagePath} />`);
                }
            } else {
                boardSpace.empty();
            }
        });
    }
}

module.exports = Board;
