import {
    NUM_FILES,
    NUM_RANKS
} from './constants';

function determineSpaceColor(position) {
    const index = positionToIndex(position);
    const fileNum = index % NUM_FILES
    const rankNum = Math.floor(index / NUM_FILES) % NUM_RANKS
    const spaceColorVal = rankNum + fileNum + 1;
    return spaceColorVal % 2 === 1 ? 'dark' : 'light';
}

function fileFromIndex(index) {
    return String.fromCharCode((index % NUM_FILES) + 65);
}

function rankFromIndex(index) {
    return Math.floor(index / NUM_FILES) + 1;
}

function fileFromPosition(position) {
    return fileFromIndex(positionToIndex(position));
}

function rankFromPosition(position) {
    return rankFromIndex(positionToIndex(position));
}

function positionToIndex(position) {
    // subtract 65 to map 'A' to 0
    const file = position.toUpperCase().charCodeAt(0) - 65;
    const rank = parseInt(position.substring(1)) - 1;
    return (rank * NUM_FILES) + file;
}

function indexToPosition(index) {
    const file = fileFromIndex(index);
    const rank = rankFromIndex(index);
    return `${file}${rank}`;
}

function incrementFile(file, increment) {
    // A --> 1
    const fileNumber = file.toUpperCase().charCodeAt(0) - 64;
    const incrementedFileNumber = fileNumber + increment;
    if (incrementedFileNumber < 1 || incrementedFileNumber > NUM_FILES) {
        return null;
    }
    return String.fromCharCode(incrementedFileNumber + 64);
}

function incrementRank(rank, increment) {
    const incrementedRank = rank + increment;
    if (incrementedRank < 1 || incrementedRank > NUM_RANKS) {
        return null;
    }
    return incrementedRank;
}


module.exports = {
    determineSpaceColor,
    fileFromIndex,
    rankFromIndex,
    fileFromPosition,
    rankFromPosition,
    positionToIndex,
    indexToPosition,
    incrementFile,
    incrementRank,
};
