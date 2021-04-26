import {
    SIDE,
    TURN_STATE,
    PIECE_NOTATION,
    MOVE_TYPE,
    REMOTE_CHESS_ACTION_TYPE,
} from './constants';

import {
    Queen,
    Rook,
    Knight,
    Bishop,
} from './piece';


class ChessTurn {
    constructor(side) {
        this.side = side;
        this.capturedSpacePosition = null;
        this.check = false;
        this.checkmate = false;
        this.executed = false;

        this.piece = null;
        this.type = null;
        this.startingSpacePosition = null;
        this.endingSpacePosition = null;

        this.promotedToPiece = null;
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

    get isKingsideCastle() {
        return this.type === MOVE_TYPE.KINGSIDE_CASTLE;
    }

    get isQueensideCastle() {
        return this.type === MOVE_TYPE.QUEENSIDE_CASTLE;
    }

    get isCastle() {
        return this.isKingsideCastle || this.isQueensideCastle;
    }

    get isEnPassant() {
        return this.type === MOVE_TYPE.EN_PASSANT;
    }

    get isPromotion() {
        return this.type === MOVE_TYPE.PROMOTION;
    }

    get isWhite() {
        return this.side === SIDE.WHITE;
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

    executeCastle(board) {
        let rookStartingPosition;
        let rookEndingPosition;
        if (this.isKingsideCastle) {
            rookStartingPosition = this.isWhite ? 'H1' : 'H8';
            rookEndingPosition = this.isWhite ? 'F1' : 'F8';
        } else {
            rookStartingPosition = this.isWhite ? 'A1' : 'A8';
            rookEndingPosition = this.isWhite ? 'D1' : 'D8';
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

    executeEnPassant(board) {
        const startingSpace = board.spaceByPosition(this.startingSpacePosition);
        const endingSpace = board.spaceByPosition(this.endingSpacePosition);
        this.piece = startingSpace.piece;
        this.piece.hasMoved = true;

        this.capturedSpacePosition = endingSpace.getRelativeSpacePosition(0, -this.piece.forwardRankIncrement);
        const capturedSpace = board.spaceByPosition(this.capturedSpacePosition);
        capturedSpace.piece.isCaptured = true;

        startingSpace.piece = null;
        endingSpace.piece = this.piece;
        capturedSpace.piece = null;
        this.executed = true;
    }

    execute(board) {
        if (this.isCastle) {
            this.executeCastle(board);
        } else if(this.isEnPassant) {
            this.executeEnPassant(board);
        } else {
            this.executeNormalMove(board);
        }
    }

    toAlgebraicNotation() {
        // TODO: Not quite there yet.. this should be understandable, but not nice and minimized like it should be
        // Really, it'd be great to remove the serialization methods and to just serialize through algebraic
        // notation...
        if (this.isKingsideCastle) {
            return '0-0';
        } else if (this.isQueensideCastle) {
            return '0-0-0';
        }
        const start = this.startingSpacePosition;
        const end = this.endingSpacePosition;
        const piece = this.piece.notation === PIECE_NOTATION.PAWN ? '' : this.piece.notation;
        const cap = this.capturedSpacePosition !== null ? 'x' : '';
        const check = (this.check && !this.checkmate) ? '+' : '';
        const mate = this.checkmate ? '#' : '';
        return `${piece}${start} ${cap}${end}${check}${mate}`;
    }

    serializedOptions() {
        if (this.isPromotion) {
            return this.promotedToPiece;
        }
        return '';
    }

    serialize() {
        const options = this.serializedOptions();
        return `${this.side}|${this.startingSpacePosition}|${this.endingSpacePosition}|${this.type}|${options}`;
    }

    static deserialize(serialized) {
        const split = serialized.split('|');
        const turn = new ChessTurn(split[0]);
        turn.startingSpacePosition = split[1];
        turn.endingSpacePosition = split[2];
        turn.type = split[3];

        const options =  split[4];
        if (turn.isPromotion) {
            turn.promotedToPiece = options;
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

    setEndingPieceSpace(space) {
        if (!this.isInState(TURN_STATE.SELECTED_PIECE)) {
            throw new Error(`setEndingPieceSpace disallowed for state ${this.state}`);
        }
        this.endingSpacePosition = space.position;
    }

    setType(type) {
        this.type = type;
    }

    isInState(state) {
        return this.state === state;
    }

    finishPromotionTurn(pieceNotation, board) {
        if (!this.isPromotion) {
            throw new Error('attempted to finish promotion on non-promotion turn');
        }
        const endingSpace = board.spaceByPosition(this.endingSpacePosition);
        this.promotedToPiece = pieceNotation;
        endingSpace.piece.hasBeenPromoted = true;
        endingSpace.piece.promotedToPiece = pieceNotation;

        let promotedPiece;
        if (pieceNotation === PIECE_NOTATION.QUEEN) {
            promotedPiece = new Queen(this.side, endingSpace.piece.startingPosition);
        } else if (pieceNotation === PIECE_NOTATION.ROOK) {
            promotedPiece = new Rook(this.side, endingSpace.piece.startingPosition);
        } else if (pieceNotation === PIECE_NOTATION.KNIGHT) {
            promotedPiece = new Knight(this.side, endingSpace.piece.startingPosition);
        } else if (pieceNotation === PIECE_NOTATION.BISHOP) {
            promotedPiece = new Bishop(this.side, endingSpace.piece.startingPosition);
        } else {
            throw new Error(`invalid promotion piece notation ${pieceNotation}`);
        }
        endingSpace.piece = null;
        board.setPiece(promotedPiece, endingSpace.position);

        return promotedPiece;
    }
}

module.exports = ChessTurn;
