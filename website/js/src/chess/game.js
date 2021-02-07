import _ from 'lodash';

import {
    PIECE_NOTATION,
    SIDE,
    GAME_STATE,
    SPACE_STATE,
    TURN_STATE,
    MOVE_TYPE,
} from './constants';

import Analyzer from './analyzer';
import Board from './board';
import ChessTurn from './chessTurn';
import GameInfo from './gameInfo';

import {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
} from './piece';


const WHITE_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'] },
    { Piece: Rook, startingPositions: ['A1', 'H1'] },
    { Piece: Knight, startingPositions: ['B1', 'G1'] },
    { Piece: Bishop, startingPositions: ['C1', 'F1'] },
    { Piece: Queen, startingPositions: ['D1'] },
    { Piece: King, startingPositions: ['E1'] },
];

const BLACK_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'] },
    { Piece: Rook, startingPositions: ['A8', 'H8'] },
    { Piece: Knight, startingPositions: ['B8', 'G8'] },
    { Piece: Bishop, startingPositions: ['C8', 'F8'] },
    { Piece: Queen, startingPositions: ['D8'] },
    { Piece: King, startingPositions: ['E8'] },
];


class ChessGame {
    constructor() {
        this.board = new Board();
        this.gameInfo = new GameInfo();
        this.analyzer = new Analyzer();

        this.whitePieces = this.initializePieces(WHITE_PIECE_SETUP, SIDE.WHITE);
        this.blackPieces = this.initializePieces(BLACK_PIECE_SETUP, SIDE.BLACK);

        this.isInCheck = false;
        this.isInCheckmate = false;
        this.currentSide = null;
        this.gameState = GAME_STATE.NOT_STARTED;
        this.turns = [];

        this.board.setOnSpaceSelectListener(this.onBoardSpaceSelect.bind(this));
        this.board.render();

        this.startGame();
        console.log(this);
    }

    initializePieces(pieceSetup, side) {
        const pieces = [];
        _.each(pieceSetup, (pieceSetup) => {
            _.each(pieceSetup.startingPositions, (startingPosition) => {
                const piece = new pieceSetup.Piece(side, startingPosition);
                this.board.setPiece(piece, startingPosition);
                pieces.push(piece);
            });
        });

        return pieces;
    }

    get currentTurn() {
        return this.turns[this.turns.length - 1];
    }

    get opponentSide() {
        return this.currentSide === SIDE.WHITE ? SIDE.BLACK : SIDE.WHITE;
    }

    get opponentKing() {
        return _.find(this.opponentSidePieces, piece => piece.notation === PIECE_NOTATION.KING);
    }

    get currentKing() {
        return _.find(this.currentSidePieces, piece => piece.notation === PIECE_NOTATION.KING);
    }

    get opponentSidePieces() {
        return this.currentSide === SIDE.WHITE ? this.blackPieces : this.whitePieces;
    }

    get currentSidePieces() {
        return this.currentSide === SIDE.WHITE ? this.whitePieces : this.blackPieces;
    }

    onBoardSpaceSelect(space) {
        if (this.gameState !== GAME_STATE.PLAYING) {
            return;
        }
        if (this.currentTurn.isInState(TURN_STATE.EMPTY)) {
            if (space.piece && space.piece.getPossibleMoves(this.board, space).length) {
                if (space.piece.side === this.currentTurn.side) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space);
                }
            }
        } else if (this.currentTurn.isInState(TURN_STATE.SELECTED_PIECE)) {
            const startingSpace = this.board.spaceByPosition(this.currentTurn.startingSpacePosition);
            const possibleMoves = startingSpace.piece.getPossibleMoves(this.board, startingSpace);
            const possibleSpecialMoves = _.filter(possibleMoves, move => move.type !== MOVE_TYPE.NORMAL);
            const specialMove = _.find(possibleSpecialMoves, move => move.position === space.position);

            if (space.piece && space.piece.side === this.currentTurn.side) {
                const setStartingSpace = space.position !== this.currentTurn.startingSpacePosition;
                this.currentTurn.unsetStartingPieceSpace();
                this.board.clearBoardState();
                if (setStartingSpace) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space);
                }
            } else if (_.map(possibleMoves, move => move.position).includes(space.position)) {
                if (this.analyzer.willMoveResultInSelfCheck(this.currentTurn.startingSpacePosition, space.position)) {
                    this.gameInfo.setNote('Attempted move results in check - invalid');
                    return;
                }
                this.currentTurn.setEndingPieceSpace(space);
                const moveType = specialMove ? specialMove.type :  MOVE_TYPE.NORMAL;
                this.currentTurn.setType(moveType);
                this.board.executeTurn(this.currentTurn);
                this.board.refreshBoard();
                this.endTurn();
            }
        }
    }

    startGame() {
        this.gameState = GAME_STATE.PLAYING;
        this.currentSide = SIDE.WHITE;
        this.startNextTurn();
    }

    startNextTurn() {
        this.turns.push(new ChessTurn(this.currentSide));
        this.gameInfo.setTurn(this.currentTurn);
        this.analyzer.setup(this.board);
    }

    endGame() {
        this.gameState = GAME_STATE.COMPLETE;
        this.currentTurn.checkmate = true;
        this.gameInfo.setCheckmate(this.currentTurn.side);
        GameInfo.log('Game over!');
    }

    logTurn() {
        // TODO: set check and checkmate on currentTurn right after execute
        // Probably from board.js. Should be set before the turn state goes to
        // executed
        this.currentTurn.check = this.analyzer.isInCheck(this.opponentSide);
        this.currentTurn.checkmate = this.analyzer.isInCheckmate(this.opponentSide);
        GameInfo.log(`${this.turns.length}. ${this.currentTurn.toAlgebraicNotation()}`);
        if (this.currentTurn.check && !this.currentTurn.checkmate) {
            const movesToGetOutOfCheck = this.analyzer.movesToGetOutOfCheck(this.opponentSide);
            if (movesToGetOutOfCheck.length) {
                GameInfo.smallLog('Possible moves:');
                _.each(movesToGetOutOfCheck, move => {
                    GameInfo.smallLog(` - ${move[0]} to ${move[1]}`);
                });
            }
        }
    }

    setPlayConditions() {
        if (this.analyzer.isInCheck(this.opponentSide)) {
            if (this.analyzer.isInCheckmate(this.opponentSide)) {
                this.isInCheckmate = true;
            } else {
                const checkSpacePositions = this.analyzer.findSpacesCausingCheckAgainst(this.opponentSide);
                _.each(checkSpacePositions, (position) => {
                    const space = this.board.spaceByPosition(position);
                    space.setState(SPACE_STATE.CHECK_THREAT);
                });
                this.currentTurn.check = true;
                this.gameInfo.setChecks(checkSpacePositions);
                this.isInCheck = true;
            }
        } else {
            this.gameInfo.setChecks(null);
            this.isInCheck = false;
        }
    }

    endTurn() {
        this.analyzer.setup(this.board);
        this.logTurn();
        this.setPlayConditions();
        if (this.isInCheckmate) {
            this.endGame();
        } else {
            this.currentSide = this.currentSide === SIDE.WHITE ? SIDE.BLACK : SIDE.WHITE;
            this.startNextTurn();
        }
    }
}


module.exports = ChessGame;
