const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const SIDE = {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
};

const PIECE_NOTATION = {
    PAWN: 'P',
    KNIGHT: 'N',
    BISHOP: 'B',
    ROOK: 'R',
    QUEEN: 'Q',
    KING: 'K',
};

const SPACE_STATE = {
    SELECTED: 'selected',
    POSSIBLE_MOVE: 'possible-move',
    CHECK_THREAT: 'check-threat',
};

const TURN_STATE = {
    EMPTY: 'empty',
    SELECTED_PIECE: 'selected_piece',
    READY: 'ready',
    EXECUTED: 'executed',
};

const GAME_STATE = {
    NOT_STARTED: 'not_started',
    PLAYING: 'playing',
    COMPLETE: 'complete',
};

const MOVEMENT_GROUPS = {
    DIAGONALS: [
        [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]],
        [[1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7]],
        [[-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7]],
        [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]],
    ],
    SQUARE: [
        [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
        [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7]],
        [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
        [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0]],
    ],
};

module.exports = {
    BOARD_HEIGHT,
    BOARD_WIDTH,

    GAME_STATE,
    SPACE_STATE,
    TURN_STATE,

    SIDE,
    PIECE_NOTATION,
    MOVEMENT_GROUPS,
};
