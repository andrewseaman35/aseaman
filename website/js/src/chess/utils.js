function fileFromIndex(index) {
    return String.fromCharCode((index % 8) + 65);
}

function rankFromIndex(index) {
    return Math.floor(index / 8) + 1;
}

function positionToIndex(position) {
    // subtract 65 to map 'A' to 0
    const file = position.toUpperCase().charCodeAt(0) - 65;
    const rank = parseInt(position[1]) - 1;
    return (rank * 8) + file;
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
    if (incrementedFileNumber < 1 || incrementedFileNumber > 8) {
        return null;
    }
    return String.fromCharCode(incrementedFileNumber + 64);
}

function incrementRank(rank, increment) {
    const incrementedRank = rank + increment;
    if (incrementedRank < 1 || incrementedRank > 8) {
        return null;
    }
    return incrementedRank;
}


module.exports = {
    fileFromIndex,
    rankFromIndex,
    positionToIndex,
    indexToPosition,
    incrementFile,
    incrementRank,
};
