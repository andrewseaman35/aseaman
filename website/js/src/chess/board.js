import $ from 'jquery';
import _ from 'lodash';

import {
    SPACE_STATE,
    MOVE_TYPE,
    SIDE,
    PIECE_NOTATION,
} from './constants';

import {
    determineSpaceColor,
    positionToIndex,
    indexToPosition,
    fileFromIndex,
} from './utils';

import Space from './space';


class Board {
    constructor(options) {
        this.numRanks = options.numRanks;
        this.numFiles = options.numFiles;
        this.fileType = options.fileType || "normal";
        this.spaces = null;

        this.reinitialize(options);
    }

    resetStartPositions() {
        this.startPositions = {
            [SIDE.WHITE]: {
                [PIECE_NOTATION.PAWN]: [],
                [PIECE_NOTATION.KNIGHT]: [],
                [PIECE_NOTATION.BISHOP]: [],
                [PIECE_NOTATION.ROOK]: [],
                [PIECE_NOTATION.QUEEN]: [],
                [PIECE_NOTATION.KING]: [],
            },
            [SIDE.BLACK]: {
                [PIECE_NOTATION.PAWN]: [],
                [PIECE_NOTATION.KNIGHT]: [],
                [PIECE_NOTATION.BISHOP]: [],
                [PIECE_NOTATION.ROOK]: [],
                [PIECE_NOTATION.QUEEN]: [],
                [PIECE_NOTATION.KING]: [],
            },
        };
    }

    setOnSpaceSelectListener(listener) {
        this.onSpaceSelectListener = listener;
    }

    setStartingPosition(piece, position) {
        this.startPositions[piece.side][piece.notation].push(position);
        this.setPiece(piece, position);
    }

    setPiece(piece, position) {
        const spaceIndex = positionToIndex(position, this.numFiles);
        this.spaces[spaceIndex].setPiece(piece);
    }

    onBoardSpaceClick(event) {
        if (this.onSpaceSelectListener) {
            const space = this.spaceByPosition(event.currentTarget.id);
            this.onSpaceSelectListener(space);
        }
    }

    spaceByPosition(position) {
        return this.spaces[positionToIndex(position, this.numFiles)];
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
            endingKingPosition = king.side === SIDE.WHITE ? 'G1' : `G${this.numRanks}`;
        } else {
            endingKingPosition = king.side === SIDE.WHITE ? 'C1' : `C${this.numRanks}`;
        }
        this.spaces[positionToIndex(endingKingPosition, this.numFiles)].setState(SPACE_STATE.POSSIBLE_SPECIAL_MOVE);
    }

    displayPossibleMoves(space, previousTurn) {
        this.clearBoardState();
        const piece = space.piece;
        space.setState(SPACE_STATE.SELECTED);
        if (piece) {
            const possibleMoves = space.piece.getPossibleMoves(this, space, previousTurn);
            _.each(possibleMoves, (move) => {
                if (move.type === MOVE_TYPE.NORMAL) {
                    this.spaces[positionToIndex(move.position, this.numFiles)].setState(SPACE_STATE.POSSIBLE_MOVE);
                } else {
                    this.spaces[positionToIndex(move.position, this.numFiles)].setState(SPACE_STATE.POSSIBLE_SPECIAL_MOVE);
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
        _.times(this.numRanks, () => {
            const rank = Math.ceil(spaceIndex / this.numFiles) + 1;
            const row = $('<tr></tr>').attr('id', `row-${rank}`);

            const rankLabelCell = $(`<td>${rank}</td>`)
                .attr('class', 'board-label rank');
            row.append(rankLabelCell);

            _.times(this.numFiles, () => {
                const position = indexToPosition(spaceIndex, this.numFiles);
                const cell = $('<td></td>')
                    .attr('id', position)
                    .attr('class', `space ${determineSpaceColor(position, this.numRanks, this.numFiles)}`);
                this.spaces[spaceIndex].setCell(cell);
                cell.on('click', this.onBoardSpaceClick.bind(this));
                row.append(cell);
                spaceIndex += 1;
            });
            table.prepend(row);
        });
        const fileLabelRow = $('<tr></tr>').attr('id', 'row-file-label');
        fileLabelRow.append($('<td></td>').attr('class', 'board-label empty'));
        _.times(this.numFiles, (i) => {
            const fileLabelCell = $(`<td>${fileFromIndex(i, this.numFiles)}</td>`)
                .attr('class', 'board-label file');
            fileLabelRow.append(fileLabelCell);
        });
        table.append(fileLabelRow);

    }

    refreshBoard() {
        this.clearBoardState();
        _.each(this.spaces, (space, spaceIndex) => {
            const position = indexToPosition(spaceIndex, this.numFiles);
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

    reinitialize(options) {
        this.resetStartPositions();
        this.numRanks = options.numRanks;
        this.numFiles = options.numFiles;
        this.fileType = options.fileType;
        this.spaces = _.times(this.numRanks * this.numFiles, i => new Space(i, options));
    }
}

module.exports = Board;
