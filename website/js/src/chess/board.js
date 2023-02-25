import $ from 'jquery';
import _ from 'lodash';

import {
    NUM_RANKS,
    NUM_FILES,
    SPACE_STATE,
    MOVE_TYPE,
    SIDE,
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
        this.spaces = _.times(NUM_RANKS * NUM_FILES, i => new Space(i));
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
        const space = _.find(
            _.filter(this.spaces, space => space.piece !== null),
            space => space.piece.isSamePiece(piece));
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

    applyTurns(turns) {
        _.each(turns, (turn) => {
            this.executeTurn(turn);
        });
    }

    executeTurn(turn) {
        turn.execute(this);
    }

    clearBoardState() {
        _.each(this.spaces, (space) => {
            space.clearState();
        });
    }

    displayPossibleCastle(king, castleMove) {
        let endingKingPosition;
        if (castleMove.move === MOVE_TYPE.KINGSIDE_CASTLE) {
            endingKingPosition = king.side === SIDE.WHITE ? 'G1' : 'G8';
        } else {
            endingKingPosition = king.side === SIDE.WHITE ? 'C1' : 'C8';
        }
        this.spaces[positionToIndex(endingKingPosition)].setState(SPACE_STATE.POSSIBLE_SPECIAL_MOVE);
    }

    displayPossibleMoves(space, previousTurn) {
        this.clearBoardState();
        const piece = space.piece;
        space.setState(SPACE_STATE.SELECTED);
        if (piece) {
            const possibleMoves = space.piece.getPossibleMoves(this, space, previousTurn);
            _.each(possibleMoves, (move) => {
                if (move.type === MOVE_TYPE.NORMAL) {
                    this.spaces[positionToIndex(move.position)].setState(SPACE_STATE.POSSIBLE_MOVE);
                } else {
                    this.spaces[positionToIndex(move.position)].setState(SPACE_STATE.POSSIBLE_SPECIAL_MOVE);
                }
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
        _.times(NUM_RANKS, () => {
            const rank = Math.ceil(spaceIndex / NUM_RANKS) + 1;
            const row = $('<tr></tr>').attr('id', `row-${rank}`);

            const rankLabelCell = $(`<td>${rank}</td>`)
                .attr('class', 'board-label rank');
            row.append(rankLabelCell);

            _.times(NUM_FILES, () => {
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
        _.times(NUM_FILES, (i) => {
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
