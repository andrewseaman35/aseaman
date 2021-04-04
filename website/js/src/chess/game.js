import _ from 'lodash';
import $ from 'jquery';

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

import {
    createNewGame,
    fetchGame,
    saveTurn,
} from  './api';

import {
    KASPAROV_TOPALOV_1999,
    SCHOLARS_MATE,
} from './replays';

const GAME_ID_LENGTH = 6;

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
        this.analyzer = new Analyzer();
        this.gameInfo = new GameInfo();

        this.whitePieces = this.initializePieces(WHITE_PIECE_SETUP, SIDE.WHITE);
        this.blackPieces = this.initializePieces(BLACK_PIECE_SETUP, SIDE.BLACK);

        this.gameId = null;
        this.isInCheck = false;
        this.isInCheckmate = false;
        this.currentSide = null;
        this.gameState = GAME_STATE.NOT_STARTED;
        this.turns = [];

        this.replayTurnIndex = null;

        this.board.render();

        this.initializeGameStartModal();
        console.log(this);
    }

    initializeGameStartModal() {
        $('#load-game-button').on('click', this.onLoadGameButtonClick.bind(this));
        $('#load-game-id-input').on('input', this.onLoadGameButtonChange.bind(this));
        $('#new-game-button').on('click', this.onStartNewGameButtonClick.bind(this));
    }

    initializeAndStartGame() {
        $('#game-start-modal').hide();
        this.gameInfo.setOnPromotionSelectListener(this.onPromotionSelect.bind(this));
        this.board.setOnSpaceSelectListener(this.onBoardSpaceSelect.bind(this));

        $('#load-button').on('click', this.loadReplayGame.bind(this));
        $('#restart-button').on('click', this.loadReplayGame.bind(this));
        $('#next-move-button').on('click', this.executeNextReplayTurn.bind(this));

        this.startGame();
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
        if (this.replayTurnIndex !== null) {
            return this.turns[this.replayTurnIndex];
        }
        return this.turns[this.turns.length - 1];
    }

    get previousTurn() {
        if (this.turns.length < 2) {
            return null;
        }
        return this.turns[this.turns.length - 2];
    }

    get previousPreviousTurn() {
        if (this.turns.length < 3) {
            return null;
        }
        return this.turns[this.turns.length - 3];
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

    onLoadGameButtonClick() {
        const gameId = $('#load-game-id-input')[0].value;
        $('#load-error').hide();
        fetchGame(gameId).then(
            (response) => {
                this.gameId = response.game_id;
                this.gameInfo.setGameId(this.gameId);
                this.turns = _.map(response.turns, turn => ChessTurn.deserialize(turn));
                this.gameState = GAME_STATE.REPLAY;
                this.replayTurnIndex = 0;
                _.times(this.turns.length, () => {
                    this.executeNextReplayTurn();
                });
                this.initializeAndStartGame();
            },
            (error) => {
                $('#load-error').text(error.responseJSON.message);
                $('#load-error').show();
            }
        );
    }

    onLoadGameButtonChange() {
        const gameId = $('#load-game-id-input')[0].value;
        $('#load-error').hide();
        $('#load-game-button').attr('disabled', (gameId.length < GAME_ID_LENGTH));
    }

    onStartNewGameButtonClick() {
        $('#new-game-error').hide();
        createNewGame().then(
            (response) => {
                this.gameId = response.game_id;
                this.gameInfo.setGameId(this.gameId);
                this.initializeAndStartGame();
            },
            (error) => {
                $('#new-game-error').text(error.responseJSON.message);
                $('#new-game-error').show();
            }
        );
    }

    loadReplayGame() {
        this.turns = _.map(KASPAROV_TOPALOV_1999.turns, turn => ChessTurn.deserialize(turn));
        this.gameState = GAME_STATE.REPLAY;
        this.replayTurnIndex = 0;

        $('#load-button').hide();
        $('#restart-button').show();
        $('#next-move-button').show();
    }

    executeNextReplayTurn() {
        this.currentSide = this.currentTurn.side;
        this.board.executeTurn(this.currentTurn);
        if (this.currentTurn.isPromotion) {
            const newPiece = this.currentTurn.finishPromotionTurn(this.currentTurn.promotedToPiece, this.board);
            this.currentSidePieces.push(newPiece);
        }
        this.board.refreshBoard();
        this.endTurn();
    }

    onPromotionSelect(event) {
        if (this.gameState !== GAME_STATE.AWAITING_INPUT) {
            return;
        }
        this.gameState = GAME_STATE.PLAYING;
        this.gameInfo.hidePromotionOptions();

        const newPiece = this.currentTurn.finishPromotionTurn(event.currentTarget.dataset.piece, this.board);
        this.currentSidePieces.push(newPiece);
        this.board.refreshBoard();
        this.endTurn();
    }

    onBoardSpaceSelect(space) {
        if (this.gameState !== GAME_STATE.PLAYING) {
            return;
        }
        if (this.currentTurn.isInState(TURN_STATE.EMPTY)) {
            if (space.piece && space.piece.getPossibleMoves(this.board, space, this.previousTurn).length) {
                if (space.piece.side === this.currentTurn.side) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space, this.previousTurn);
                }
            }
        } else if (this.currentTurn.isInState(TURN_STATE.SELECTED_PIECE)) {
            const startingSpace = this.board.spaceByPosition(this.currentTurn.startingSpacePosition);
            const possibleMoves = startingSpace.piece.getPossibleMoves(this.board, startingSpace, this.previousTurn);
            const possibleSpecialMoves = _.filter(possibleMoves, move => move.type !== MOVE_TYPE.NORMAL);
            const specialMove = _.find(possibleSpecialMoves, move => move.position === space.position);

            const selectedMove = _.find(possibleMoves, move => move.position === space.position);

            if (space.piece && space.piece.side === this.currentTurn.side) {
                const setStartingSpace = space.position !== this.currentTurn.startingSpacePosition;
                this.currentTurn.unsetStartingPieceSpace();
                this.board.clearBoardState();
                if (setStartingSpace) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space, this.previousTurn);
                }
            } else if (selectedMove) {
                if (this.analyzer.willMoveResultInSelfCheck(this.currentTurn.startingSpacePosition, selectedMove)) {
                    this.gameInfo.setNote('Attempted move results in check - invalid');
                    return;
                }
                this.currentTurn.setEndingPieceSpace(space);
                const moveType = specialMove ? specialMove.type :  MOVE_TYPE.NORMAL;
                this.currentTurn.setType(moveType);
                this.board.executeTurn(this.currentTurn);
                this.board.refreshBoard();

                if (this.currentTurn.isPromotion && this.currentTurn.promotedToPiece === null) {
                    this.gameState = GAME_STATE.AWAITING_INPUT;
                    this.gameInfo.displayPromotionOptions(this.currentTurn.side);
                } else {
                    this.endTurn();
                }
            }
        }
    }

    determineNextSideTurn() {
        return this.turns.length % 2 === 1 ? SIDE.BLACK : SIDE.WHITE;
    }

    startGame() {
        this.replayTurnIndex = null;
        this.gameState = GAME_STATE.PLAYING;
        this.currentSide = this.determineNextSideTurn();
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
        this.currentTurn.checkmate = this.analyzer.isInCheckmate(this.opponentSide, this.currentTurn);
        GameInfo.log(`${this.turns.length}. ${this.currentTurn.toAlgebraicNotation()}`);
        if (this.currentTurn.check && !this.currentTurn.checkmate) {
            const movesToGetOutOfCheck = this.analyzer.movesToGetOutOfCheck(this.opponentSide, this.currentTurn);
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
            if (this.analyzer.isInCheckmate(this.opponentSide, this.previousTurn)) {
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
        if (this.gameState === GAME_STATE.PLAYING) {
            saveTurn(this.gameId, this.currentTurn.serialize());
        }
        this.analyzer.setup(this.board);
        this.logTurn();
        this.setPlayConditions();
        if (this.isInCheckmate) {
            this.endGame();
        } else {
            this.currentSide = this.currentSide === SIDE.WHITE ? SIDE.BLACK : SIDE.WHITE;
            if (this.gameState === GAME_STATE.PLAYING) {
                this.startNextTurn();
            } else if (this.gameState === GAME_STATE.REPLAY) {
                this.replayTurnIndex += 1;
            }
        }
    }
}


module.exports = ChessGame;
