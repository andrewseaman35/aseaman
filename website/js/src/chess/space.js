import _ from 'lodash';

import {
    SPACE_STATE,
} from './constants';

import {
    fileFromIndex,
    rankFromIndex,
    indexToPosition,

    incrementFile,
    incrementRank,
} from './utils';


class Space {
    constructor(index) {
        this.index = index;
        this.position = indexToPosition(this.index);
        this.rank = rankFromIndex(this.index);
        this.file = fileFromIndex(this.index);

        this.cell = null;
        this.piece = null;
    }

    getRelativeSpacePosition(fileIncrement, rankIncrement) {
        const newFile = incrementFile(this.file, fileIncrement);
        const newRank = incrementRank(this.rank, rankIncrement);
        if (newFile !== null && newRank !== null) {
            return `${newFile}${newRank}`;
        }
        return null;
    }

    get isOccupied() {
        return this.piece !== null;
    }

    setCell(cell) {
        this.cell = cell;
    }

    setPiece(piece) {
        this.piece = piece;
    }

    setState(state) {
        this.cell.addClass(state);
    }

    clearState() {
        _.each(SPACE_STATE, (state) => {
            this.cell.removeClass(state);
        });
    }
}

module.exports = Space;
