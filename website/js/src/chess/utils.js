function determineSpaceColor(position, numRanks, numFiles) {
    const index = positionToIndex(position, numFiles);
    const fileNum = index % numFiles
    const rankNum = Math.floor(index / numFiles) % numRanks
    const spaceColorVal = rankNum + fileNum + 1;
    return spaceColorVal % 2 === 1 ? 'dark' : 'light';
}

function fileFromIndex(index, numFiles) {
    return String.fromCharCode((index % numFiles) + 65);
}

function rankFromIndex(index, numFiles) {
    return Math.floor(index / numFiles) + 1;
}

function fileFromPosition(position, numFiles) {
    if (position === null) {
        return null;
    }
    return fileFromIndex(positionToIndex(position, numFiles), numFiles);
}

function rankFromPosition(position, numFiles) {
    return rankFromIndex(positionToIndex(position, numFiles), numFiles);
}

function positionToIndex(position, numFiles) {
    // subtract 65 to map 'A' to 0
    const file = position.toUpperCase().charCodeAt(0) - 65;
    const rank = parseInt(position.substring(1)) - 1;
    return (rank * numFiles) + file;
}

function indexToPosition(index, numFiles) {
    const file = fileFromIndex(index, numFiles);
    const rank = rankFromIndex(index, numFiles);
    return `${file}${rank}`;
}

function incrementFile(file, increment, numFiles) {
    // A --> 1
    const fileNumber = file.toUpperCase().charCodeAt(0) - 64;
    const incrementedFileNumber = fileNumber + increment;
    if (incrementedFileNumber < 1 || incrementedFileNumber > numFiles) {
        return null;
    }
    return String.fromCharCode(incrementedFileNumber + 64);
}

function incrementRank(rank, increment, numRanks) {
    const incrementedRank = rank + increment;
    if (incrementedRank < 1 || incrementedRank > numRanks) {
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
