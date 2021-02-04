import {
    SIDE,
    TURN_STATE,
} from './constants';


class ChessTurn {
    constructor(side) {
        this.side = side;
        this.isCapture = null;
        this.check = false;
        this.checkmate = false;
        this.executed = false;

        this.piece = null;
        this.startingSpacePosition = null;
        this.endingSpacePosition = null;
    }

    get pieceNotation() {
        if (this.piece) {
            return this.piece.notation;
        }
        return null;
    }

    get state() {
        if (this.startingSpacePosition === null) {
            return TURN_STATE.EMPTY;
        }
        if (this.endingSpacePosition === null) {
            return TURN_STATE.SELECTED_PIECE;
        }
        if (this.executed) {
            return TURN_STATE.EXECUTED;
        }
        return TURN_STATE.READY;
    }

    execute(board) {
        const startingSpace = board.spaceByPosition(this.startingSpacePosition);
        const endingSpace = board.spaceByPosition(this.endingSpacePosition);
        this.piece = startingSpace.piece;
        this.isCapture = endingSpace.isOccupied && (endingSpace.piece.side !== this.side);

        if (this.isCapture) {
            endingSpace.piece.isCaptured = true;
        }
        startingSpace.piece = null;
        endingSpace.piece = this.piece;

        this.executed = true;
    }

    serialize() {
        return `${this.side}|${this.startingSpacePosition}|${this.endingSpacePosition}`;
    }

    static deserialize(serialized) {
        const split = serialized.split('|');
        const turn = new ChessTurn(split[0]);
        turn.startingSpacePosition = split[1];
        turn.endingSpacePosition = split[2];

        return turn;
    }

    unsetStartingPieceSpace() {
        if (!this.isInState(TURN_STATE.SELECTED_PIECE)) {
            throw new Error(`unsetStartingPieceSpace disallowed for state ${this.state}`);
        }
        this.startingSpacePosition = null;
    }

    setStartingPieceSpace(space) {
        if (!this.isInState(TURN_STATE.EMPTY)) {
            throw new Error(`setStartingPieceSpace disallowed for state ${this.state}`);
        }
        this.startingSpacePosition = space.position;
    }

    setEndingPieceSpace(space) {
        if (!this.isInState(TURN_STATE.SELECTED_PIECE)) {
            throw new Error(`setEndingPieceSpace disallowed for state ${this.state}`);
        }
        this.endingSpacePosition = space.position;
    }

    isInState(state) {
        return this.state === state;
    }
}

module.exports = ChessTurn;
