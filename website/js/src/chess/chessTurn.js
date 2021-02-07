import {
    SIDE,
    TURN_STATE,
    PIECE_NOTATION,
    SPECIAL_MOVE,
} from './constants';


class ChessTurn {
    constructor(side) {
        this.side = side;
        this.capturedSpacePosition = null;
        this.check = false;
        this.checkmate = false;
        this.executed = false;

        this.piece = null;
        this.specialMove = null;
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

    get isSpecial() {
        return this.specialMove !== null;
    }

    get isKingsideCastle() {
        return this.specialMove === SPECIAL_MOVE.KINGSIDE_CASTLE;
    }

    get isQueensideCastle() {
        return this.specialMove === SPECIAL_MOVE.QUEENSIDE_CASTLE;
    }

    get isCastle() {
        return this.isKingsideCastle || this.isQueensideCastle;
    }

    executeNormalMove(board) {
        const startingSpace = board.spaceByPosition(this.startingSpacePosition);
        const endingSpace = board.spaceByPosition(this.endingSpacePosition);
        this.piece = startingSpace.piece;
        this.capturedSpacePosition = (
            endingSpace.isOccupied && (endingSpace.piece.side !== this.side) ? endingSpace.position : null
        );
        this.piece.hasMoved = true;

        if (this.capturedSpacePosition !== null) {
            endingSpace.piece.isCaptured = true;
        }
        startingSpace.piece = null;
        endingSpace.piece = this.piece;

        this.executed = true;
    }

    executeCastle(board, castleMove) {
        let rookStartingPosition;
        let rookEndingPosition;
        if (castleMove === SPECIAL_MOVE.KINGSIDE_CASTLE) {
            rookStartingPosition = this.side === SIDE.WHITE ? 'H1' : 'H8';
            rookEndingPosition = this.side === SIDE.WHITE ? 'F1' : 'F8';
        } else {
            rookStartingPosition = this.side === SIDE.WHITE ? 'A1' : 'A8';
            rookEndingPosition = this.side === SIDE.WHITE ? 'D1' : 'D8';
        }

        const kingStartingSpace = board.spaceByPosition(this.startingSpacePosition);
        const kingEndingSpace = board.spaceByPosition(this.endingSpacePosition);
        const rookStartingSpace = board.spaceByPosition(rookStartingPosition);
        const rookEndingSpace = board.spaceByPosition(rookEndingPosition);

        this.piece = kingStartingSpace.piece;
        this.piece.hasMoved = true;
        kingStartingSpace.piece = null;
        kingEndingSpace.piece = this.piece;

        const rook = rookStartingSpace.piece;
        rookStartingSpace.piece = null;
        rookEndingSpace.piece = rook;
        rook.hasMoved = true;
        this.executed = true;
    }

    execute(board) {
        if (this.isCastle) {
            this.executeCastle(board, this.specialMove);
        } else {
            this.executeNormalMove(board);
        }
    }

    toAlgebraicNotation() {
        // TODO: Not quite there yet.. this should be understandable, but not nice and minimized like it should be
        if (this.isKingsideCastle) {
            return '0-0';
        } else if (this.isQueensideCastle) {
            return '0-0-0';
        }
        const start = this.startingSpacePosition;
        const end = this.endingSpacePosition;
        const piece = this.piece.notation === PIECE_NOTATION.PAWN ? '' : this.piece.notation;
        const cap = this.capturedSpacePosition !== null ? 'x' : '';
        const check = this.check ? '+' : '';
        const mate = this.checkmate ? '#' : '';
        return `${piece}${start} ${cap}${end}${check}${mate}`;
    }

    serialize() {
        const special = this.specialMove === null ? '' : this.specialMove;
        return `${this.side}|${this.startingSpacePosition}|${this.endingSpacePosition}|${special}`;
    }

    static deserialize(serialized) {
        const split = serialized.split('|');
        const turn = new ChessTurn(split[0]);
        const specialMove = split[3];
        turn.startingSpacePosition = split[1];
        turn.endingSpacePosition = split[2];
        if (specialMove.length) {
            turn.specialMove = specialMove;
        }

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

    setEndingPieceSpace(space, specialMove) {
        if (!this.isInState(TURN_STATE.SELECTED_PIECE)) {
            throw new Error(`setEndingPieceSpace disallowed for state ${this.state}`);
        }
        if (specialMove) {
            this.specialMove = specialMove;
        }
        this.endingSpacePosition = space.position;
    }

    isInState(state) {
        return this.state === state;
    }
}

module.exports = ChessTurn;
