import _ from 'lodash';
import $ from 'jquery';

import { isLoggedIn, getUser } from '../auth';

import {
    PIECE_NOTATION,
    SIDE,
    GAME_STATE,
    SPACE_STATE,
    TURN_STATE,
    GAME_MODE,
    MOVE_TYPE,
    DEFAULT_NUM_RANKS,
    DEFAULT_NUM_FILES,
    DEFAULT_FILE_TYPE,
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
    fetchGame,
    saveTurn,
} from  './api';

import {
    KASPAROV_TOPALOV_1999,
    SCHOLARS_MATE,
} from './replays';

const POLL_INTERVAL = 5000;

const DEFAULT_WHITE_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'] },
    { Piece: Rook, startingPositions: ['A1', 'H1'] },
    { Piece: Knight, startingPositions: ['B1', 'G1'] },
    { Piece: Bishop, startingPositions: ['C1', 'F1'] },
    { Piece: Queen, startingPositions: ['D1'] },
    { Piece: King, startingPositions: ['E1'] },
];


function getPiecePositions(whitePieceSetup, numRanks) {
    const oppositeRank = (r) => numRanks - Number(r) + 1;
    const blackPieceSetup = [
        { Piece: Pawn, startingPositions: whitePieceSetup[0].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
        { Piece: Rook, startingPositions: whitePieceSetup[1].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
        { Piece: Knight, startingPositions: whitePieceSetup[2].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
        { Piece: Bishop, startingPositions: whitePieceSetup[3].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
        { Piece: Queen, startingPositions: whitePieceSetup[4].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
        { Piece: King, startingPositions: whitePieceSetup[5].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
    ];

    return {
        [SIDE.WHITE]: whitePieceSetup,
        [SIDE.BLACK]: blackPieceSetup,
    }
}


class ChessGame {
    constructor() {
        this.numRanks = DEFAULT_NUM_RANKS;
        this.numFiles = DEFAULT_NUM_FILES;
        this.fileType = DEFAULT_FILE_TYPE;
        this.board = new Board({
            numRanks: this.numRanks,
            numFiles: this.numFiles,
            fileType: this.fileType,
        });
        this.gameInfo = new GameInfo();


        // Render pieces in the default spots while the board is in the background
        const startingPieceSetup = getPiecePositions(DEFAULT_WHITE_PIECE_SETUP, this.numRanks);
        this.whitePieces = this.initializePieces(startingPieceSetup[SIDE.WHITE], SIDE.WHITE);
        this.blackPieces = this.initializePieces(startingPieceSetup[SIDE.BLACK], SIDE.BLACK);

        this.gameId = null;
        this.gameMode = null;
        this.currentUser = getUser();
        this.isPlayerOne = null;
        this.localPlayerSide = null;

        this.isInCheck = false;
        this.isInCheckmate = false;
        this.currentSide = null;
        this.gameState = GAME_STATE.NOT_STARTED;
        this.turns = [];

        this.onTurnHandlers = [];

        this.replayTurnIndex = null;

        this.board.render();

        console.log(this);
    }

    initializeGame() {
        $('#game-start-modal').hide();
        this.gameInfo.setOnPromotionSelectListener(this.onPromotionSelect.bind(this));
        this.board.setOnSpaceSelectListener(this.onBoardSpaceSelect.bind(this));
    }

    initializePieces(pieceSetup, side) {
        const pieces = [];
        _.each(pieceSetup, (pieceSetup) => {
            _.each(pieceSetup.startingPositions, (startingPosition) => {
                const piece = new pieceSetup.Piece(side, startingPosition, this.board);
                this.board.setStartingPosition(piece, startingPosition);
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

    newGame(game) {
        this.gameId = game.id,
        this.gameMode = game.mode;
        const playerTwo = game.playerTwo;

        this.numRanks = game.options.ranks;
        this.numFiles = game.options.files;
        this.fileType = game.options.fileType;

        this.gameInfo.setGameId(this.gameId);
        this.gameInfo.setGameMode(this.gameMode);
        this.gameInfo.setOpponent(playerTwo);
        this.gameInfo.setPlayingAs(this.gameMode === GAME_MODE.NETWORK ? this.localPlayerSide : null);

        this.localPlayerSide = SIDE.WHITE;

        const startingPieceSetup = getPiecePositions(DEFAULT_WHITE_PIECE_SETUP, this.numRanks);
        this.board.reinitialize({
            numRanks: this.numRanks,
            numFiles: this.numFiles,
            fileType: this.fileType,
        });
        this.whitePieces = this.initializePieces(startingPieceSetup[SIDE.WHITE], SIDE.WHITE);
        this.blackPieces = this.initializePieces(startingPieceSetup[SIDE.BLACK], SIDE.BLACK);
        this.analyzer = new Analyzer({
            numRanks: this.numRanks,
            numFiles: this.numFiles,
            fileType: this.fileType,
        });
        this.board.render()

        this.initializeGame();
        this.startGame();
    }

    loadGame(game) {
        this.gameId = game.id;
        this.gameMode = game.mode;
        this.gameInfo.setGameId(this.gameId)
        this.gameInfo.setGameMode(this.gameMode)

        if (this.gameMode === GAME_MODE.NETWORK) {
            if (isLoggedIn()) {
                this.isPlayerOne = game.playerOne === this.currentUser;
                this.localPlayerSide = this.isPlayerOne ? SIDE.WHITE : SIDE.BLACK;
                const opponent = this.isPlayerOne ? game.playerTwo : game.playerOne;
                this.gameInfo.setOpponent(opponent);
            } else {
                this.localPlayerSide = SIDE.BLACK;
            }
            this.gameInfo.setPlayingAs(this.localPlayerSide);
        } else {
            this.gameInfo.setPlayingAs(null);
        }
        this.turns = _.map(game.turns, turn => ChessTurn.deserialize(turn));
        this.gameState = GAME_STATE.REPLAY;
        this.replayTurnIndex = 0;
        _.times(this.turns.length, () => {
            this.executeNextReplayTurn();
        });
        this.initializeGame();

        const ourTurnModTwoRemainder = this.localPlayerSide === SIDE.BLACK ? 1 : 0;
        const isOurTurn = this.turns.length % 2 === ourTurnModTwoRemainder;
        if (this.gameMode === GAME_MODE.NETWORK && !isOurTurn) {
            this.pollForNextTurn();
        } else {
            this.startGame();
        }
    }

    pollForNextTurn() {
        this.gameInfo.setNetworkPlayState('Waiting for opponent...');
        fetchGame(this.gameId).then(
            (response) => {
                const turns = response.turns;
                const lastTurn = turns.length ? ChessTurn.deserialize(_.last(turns)) : null;
                if (lastTurn && lastTurn.side !== this.localPlayerSide && turns.length >= this.turns.length) {
                    this.gameState = GAME_STATE.REPLAY;
                    this.replayTurnIndex = this.turns.length;
                    console.log(lastTurn)
                    this.turns.push(lastTurn);
                    this.executeNextReplayTurn();

                    this.fireOnTurnHandlers(this.board, lastTurn);

                    this.gameState = GAME_STATE.PLAYING;
                    this.replayTurnIndex = null;
                    this.startGame();
                    this.gameInfo.setNetworkPlayState('');
                } else {
                    setTimeout(this.pollForNextTurn.bind(this), POLL_INTERVAL);
                }
            },
            (error) => {

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

    setOnTurnHandler(handler) {
        this.onTurnHandlers.push(handler);
    }

    fireOnTurnHandlers(board, turn) {
        this.onTurnHandlers.forEach(f => f(board, turn));
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
            // If no piece is selected and there's a piece on the selected space,
            // show that piece as selected.
            if (space.piece && space.piece.getPossibleMoves(this.board, space, this.previousTurn).length) {
                if (space.piece.side === this.currentTurn.side) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space, this.previousTurn);
                }
            }
        } else if (this.currentTurn.isInState(TURN_STATE.SELECTED_PIECE)) {
            // If there is a selected piece already and we click a new space...
            const startingSpace = this.board.spaceByPosition(this.currentTurn.startingSpacePosition);
            const possibleMoves = startingSpace.piece.getPossibleMoves(this.board, startingSpace, this.previousTurn);
            const possibleSpecialMoves = _.filter(possibleMoves, move => move.type !== MOVE_TYPE.NORMAL);
            const specialMove = _.find(possibleSpecialMoves, move => move.position === space.position);

            const selectedMove = _.find(possibleMoves, move => move.position === space.position);

            if (space.piece && space.piece.side === this.currentTurn.side) {
                // If the selected space has a piece of the same side, deselect the current
                // piece and select the other one
                const setStartingSpace = space.position !== this.currentTurn.startingSpacePosition;
                this.currentTurn.unsetStartingPieceSpace();
                this.board.clearBoardState();
                if (setStartingSpace) {
                    this.currentTurn.setStartingPieceSpace(space);
                    this.board.displayPossibleMoves(space, this.previousTurn);
                }
            } else if (selectedMove) {
                // If the selected space is a valid move for the selected piece, execute the move.
                if (this.analyzer.willMoveResultInSelfCheck(this.currentTurn.startingSpacePosition, selectedMove)) {
                    this.gameInfo.setNote('Attempted move results in check - invalid');
                    return;
                }
                this.currentTurn.setEndingPieceSpace(space);
                const moveType = specialMove ? specialMove.type :  MOVE_TYPE.NORMAL;
                this.currentTurn.setType(moveType);
                this.board.executeTurn(this.currentTurn);
                this.board.refreshBoard();

                this.fireOnTurnHandlers(this.board, this.currentTurn);

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
        console.log("SETTING PLAY CONDITONS ********")
        if (this.analyzer.isInCheck(this.opponentSide)) {
            if (this.analyzer.isInCheckmate(this.opponentSide, this.previousTurn)) {
                console.log("is in checkmate")
                this.isInCheckmate = true;
            } else {
                console.log("----------------is in check")
                const checkSpacePositions = this.analyzer.findSpacesCausingCheckAgainst(this.opponentSide);
                console.log(checkSpacePositions)
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
        this.setPlayConditions();
        this.logTurn();
        if (this.isInCheckmate) {
            this.endGame();
        } else {
            this.currentSide = this.currentSide === SIDE.WHITE ? SIDE.BLACK : SIDE.WHITE;
            if (this.gameState === GAME_STATE.PLAYING) {
                if (this.gameMode === GAME_MODE.LOCAL) {
                    this.startNextTurn();
                } else {
                    this.pollForNextTurn();
                }
            } else if (this.gameState === GAME_STATE.REPLAY) {
                this.replayTurnIndex += 1;
            }
        }
    }
}


module.exports = ChessGame;
