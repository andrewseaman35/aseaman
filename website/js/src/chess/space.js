import {
    fileFromIndex,
    rankFromIndex,
    positionToIndex,
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

        this.piece = null;
    }

    getRelativeSpace(fileIncrement, rankIncrement) {
        const newFile = incrementFile(this.file, fileIncrement);
        const newRank = incrementRank(this.rank, rankIncrement);
        if (newFile !== null && newRank !== null) {
            return `${newFile}${newRank}`;
        }
        return null;
    }

    setPiece(piece) {
        this.piece = piece;
    }
}

module.exports = Space;
