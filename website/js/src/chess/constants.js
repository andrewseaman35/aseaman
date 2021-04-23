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

const REMOTE_CHESS_ACTION_TYPE = {
    MOVE_TO_SPACE: 'move_to_space',
    REMOVE_FROM_BOARD: 'remove_from_board',
};

const SPACE_STATE = {
    SELECTED: 'selected',
    POSSIBLE_MOVE: 'possible-move',
    POSSIBLE_SPECIAL_MOVE: 'possible-special-move',
    CHECK_THREAT: 'check-threat',
};

const TURN_STATE = {
    EMPTY: 'empty',
    SELECTED_PIECE: 'selected_piece',
    READY: 'ready',
    EXECUTED: 'executed',
};

const GAME_STATE = {
    REPLAY: 'replay',
    NOT_STARTED: 'not_started',
    AWAITING_INPUT: 'awaiting_input',
    PLAYING: 'playing',
    COMPLETE: 'complete',
};

const GAME_MODE = {
    LOCAL: 'local',
    NETWORK: 'network',
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

const MOVE_TYPE = {
    NORMAL: 'normal',
    KINGSIDE_CASTLE: 'kingside_castle',
    QUEENSIDE_CASTLE: 'queenside_castle',
    EN_PASSANT: 'en_passant',
    PROMOTION: 'promotion',
};

module.exports = {
    BOARD_HEIGHT,
    BOARD_WIDTH,

    GAME_MODE,
    GAME_STATE,
    SPACE_STATE,
    TURN_STATE,

    SIDE,
    PIECE_NOTATION,
    MOVEMENT_GROUPS,
    MOVE_TYPE,
    REMOTE_CHESS_ACTION_TYPE,
};
