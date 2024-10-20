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
    constructor(index, options) {
        this.index = index;
        this.numRanks = options.numRanks;
        this.numFiles = options.numFiles;
        this.position = indexToPosition(this.index, this.numFiles);
        this.rank = rankFromIndex(this.index, this.numFiles);
        this.file = fileFromIndex(this.index, this.numFiles);
        this.fileType = options.fileType;

        this.cell = null;
        this.piece = null;
    }

    getRelativeSpacePosition(fileIncrement, rankIncrement) {
        const newFile = incrementFile(this.file, fileIncrement, this.numFiles, this.fileType);
        const newRank = incrementRank(this.rank, rankIncrement, this.numRanks);
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
