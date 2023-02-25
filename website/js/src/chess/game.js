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
    NUM_RANKS,
} from './constants';

import Analyzer from './analyzer';
import Board from './board';
import ChessTurn from './chessTurn';
import GameInfo from './gameInfo';
import RemoteChess from './remoteChess';

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
    loadUserGames,
    fetchGame,
    saveTurn,
} from  './api';

import {
    KASPAROV_TOPALOV_1999,
    SCHOLARS_MATE,
} from './replays';

const REMOTE_CHESS_ENABLED = true;
const GAME_ID_SELECT_DEFAULT = 'default'

const GAME_ID_LENGTH = 6;
const POLL_INTERVAL = 5000;

const WHITE_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'] },
    { Piece: Rook, startingPositions: ['A1', 'H1'] },
    { Piece: Knight, startingPositions: ['B1', 'G1'] },
    { Piece: Bishop, startingPositions: ['C1', 'F1'] },
    { Piece: Queen, startingPositions: ['D1'] },
    { Piece: King, startingPositions: ['E1'] },
];

const oppositeRank = (r) => NUM_RANKS - Number(r) + 1;
const BLACK_PIECE_SETUP = [
    { Piece: Pawn, startingPositions: WHITE_PIECE_SETUP[0].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
    { Piece: Rook, startingPositions: WHITE_PIECE_SETUP[1].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
    { Piece: Knight, startingPositions: WHITE_PIECE_SETUP[2].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
    { Piece: Bishop, startingPositions: WHITE_PIECE_SETUP[3].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
    { Piece: Queen, startingPositions: WHITE_PIECE_SETUP[4].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
    { Piece: King, startingPositions: WHITE_PIECE_SETUP[5].startingPositions.map(x => `${x[0]}${oppositeRank(x[1])}`) },
];


class ChessGame {
    constructor() {
        this.board = new Board();
        this.analyzer = new Analyzer();
        this.gameInfo = new GameInfo();

        this.whitePieces = this.initializePieces(WHITE_PIECE_SETUP, SIDE.WHITE);
        this.blackPieces = this.initializePieces(BLACK_PIECE_SETUP, SIDE.BLACK);

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

        this.replayTurnIndex = null;

        this.board.render();

        this.initializeGameStartModal();

        this.remoteChess = null;
        this.handConnected = false;
        if (REMOTE_CHESS_ENABLED) {
            this.remoteChess = new RemoteChess();
            this.initializeRemoteChess();
        }

        console.log(this);
    }

    initializeGameStartModal() {
        if (isLoggedIn()) {
            loadUserGames().then((response) => {
                response.forEach(game => {
                    $('#owned-game-id-select').append(`<option value="${game.game_id}">${game.game_id} (${game.game_mode})</option>`)
                })
                $('#owned-game-id-select')[0].children[0].innerHTML = 'Select a game'
                $('#owned-game-id-select').on('change', this.onGameIdSelect.bind(this));
                $('#owned-game-id-select').prop('disabled', false);
            });
            $("#network-game-mode-container").removeClass("logged-out");
            $("#network-game-mode-container").addClass("logged-in");
        } else {
            $('#owned-game-id-select')[0].children[0].innerHTML = '--';
            $("#network-game-mode-container").removeClass("logged-in");
            $("#network-game-mode-container").addClass("logged-out");
        }
        $('input[name="game-mode"]').on('change', this.onGameModeRadioButtonChange.bind(this));
        $('#load-game-button').on('click', this.onLoadGameButtonClick.bind(this));
        $('#load-game-id-input').on('input', this.onLoadGameButtonChange.bind(this));
        $('.new-game-button').on('click', this.onStartNewGameButtonClick.bind(this));
    }

    initializeRemoteChess() {
        // TODO: ugh.. I need to make another layer above the `ChessGame` layer :'(
        // Let's make a coordinator sort of class that contains `ChessGame`, these popup panels
        // in a separate class, and `GameInfo`. But I guess this works for now.
        $('.remote-setup-container').show();
        $('#toggle-remote-setup').on('click', this.toggleRemoteSetupContents.bind(this));
        $('#remote-initialize-controller').on('click', this.onInitializeController.bind(this));
        $('#remote-initialize-octoprint').on('click', this.onInitializeOctoPrint.bind(this));
        $('#remote-refresh-octoprint').on('click', this.refreshOctoPrintStatus.bind(this));
        $('#remote-refresh-controller').on('click', this.refreshControllerStatus.bind(this));
        $('#remote-home-octoprint').on('click', this.onHomeAxes.bind(this));
        $('#remote-hand-connected-octoprint').on('click', this.onMarkHandMounted.bind(this));

        this.refreshServerStatus();
        this.refreshOctoPrintStatus();
        this.refreshControllerStatus();
    }

    refreshServerStatus() {
        $('.server-status .toplevel-status').text('fetching...');
        this.remoteChess.getServerStatus().then(
            (response) => {
                $('.server-status .toplevel-status').text(response.status);
                $('.server-status .toplevel-status').toggleClass('error-message', false);
            },
            (err) => {
                $('.server-status .toplevel-status').text(err.statusText);
                $('.server-status .toplevel-status').toggleClass('error-message', true);
            }
        );
    }

    refreshOctoPrintStatus() {
        $('.octoprint-status .toplevel-status').text('fetching...');
        $('.octoprint-status .status-item span').text('fetching...');
        $('#remote-initialize-octoprint').hide();
        $('#remote-home-octoprint').hide();
        $('#remote-refresh-octoprint').hide();
        $('#remote-hand-connected-octoprint').hide();
        this.remoteChess.getOctoPrintStatus().then(
            (response) => {
                let shhEverythingIsOkay = response.initialized;
                if (response.initialized) {
                    $('.octoprint-status .initialized').text('OK');
                } else {
                    $('.octoprint-status .initialized').text('');
                    $('#remote-initialize-octoprint').show();
                }
                shhEverythingIsOkay &= response.version.status === 'OK';
                shhEverythingIsOkay &= response.connection.status === 'OK';
                shhEverythingIsOkay &= response.job.status === 'OK';
                shhEverythingIsOkay &= response.homed.status === 'OK';
                shhEverythingIsOkay &= this.handConnected;
                $('.octoprint-status .version').text(`${response.version.status} ${response.version.message}`);
                $('.octoprint-status .version').toggleClass('error-message', response.version.status !== 'OK');
                $('.octoprint-status .connection').text(`${response.connection.status} ${response.connection.message}`);
                $('.octoprint-status .connection').toggleClass('error-message', response.connection.status !== 'OK');
                $('.octoprint-status .job').text(`${response.job.status} ${response.job.message}`);
                $('.octoprint-status .job').toggleClass('error-message', response.job.status !== 'OK');
                $('.octoprint-status .toplevel-status').text(shhEverythingIsOkay ? 'OK' : 'NOT OK');
                $('.octoprint-status .toplevel-status').toggleClass('error-message', !shhEverythingIsOkay);
                if (response.initialized) {
                    $('.octoprint-status .homed').text(response.homed.status);
                    $('.octoprint-status .homed').toggleClass('error-message', response.homed.status !== 'OK');
                    if (response.homed.status !== 'OK') {
                        $('#remote-home-octoprint').show();
                    }
                } else {
                    $('.octoprint-status .homed').text('initialize first');
                }
                if (response.homed.status !== 'OK') {
                    $('.octoprint-status .hand').text('home first');
                } else if (this.handConnected) {
                    $('.octoprint-status .hand').text('OK');
                    $('.octoprint-status .hand').toggleClass('error-message', false);
                } else {
                    $('.octoprint-status .hand').text('Time to mount the hand!');
                    $('.octoprint-status .hand').toggleClass('error-message', true);
                    $('#remote-hand-connected-octoprint').show();
                }
                $('#remote-refresh-octoprint').show();
            },
            (err) => {
                $('.octoprint-status .toplevel-status').text(err.statusText);
                $('.octoprint-status .status-item span').text('NOT OK');
                $('#remote-refresh-octoprint').show();
            }
        );
    }

    refreshControllerStatus() {
        $('.controller-status .toplevel-status').text('fetching...');
        $('.controller-status .status-item span').text('fetching...');
        $('#remote-initialize-controller').hide();
        $('#remote-refresh-controller').hide();
        this.remoteChess.getControllerSerialStatus().then(
            (response) => {
                let shhEverythingIsOkay = true;
                if (response.initialized) {
                    $('.controller-status .initialized').text('OK');
                } else {
                    $('.controller-status .initialized').text('');
                    $('#remote-initialize-controller').show();
                    shhEverythingIsOkay = false;
                }
                shhEverythingIsOkay &= response.serial.status === 'OK';
                $('.controller-status .serial').text(`${response.serial.status} ${response.serial.message}`);
                $('.controller-status .serial').toggleClass('error-message', response.serial.status !== 'OK');
                $('.controller-status .toplevel-status').text(shhEverythingIsOkay ? 'OK' : 'NOT OK');
                $('.controller-status .toplevel-status').toggleClass('error-message', !shhEverythingIsOkay);
                $('#remote-refresh-controller').show();
            },
            (err) => {
                $('.controller-status .toplevel-status').text(err.statusText);
                $('.controller-status .status-item span').text('NOT OK');
                $('.controller-status .status-item span').toggleClass('error-message', true);
                $('#remote-refresh-controller').show();
            }
        );
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

    onInitializeOctoPrint() {
        $('#remote-initialize-octoprint').hide();
        $('.octoprint-status span.initialized').text('initializing...');
        this.remoteChess.initializeOctoPrint().then(
            () => this.refreshOctoPrintStatus(),
            () => {
                $('.octoprint-status span.initialized').text('error!');
                $('#remote-initialize-octoprint').show();
            }
        );
    }

    onInitializeController() {
        $('#remote-initialize-controller').hide();
        $('.controller-status span.initialized').text('initializing...');
        this.remoteChess.initializeController().then(
            () => this.refreshControllerStatus(),
            () => {
                $('.controller-status span.initialized').text('error!');
                $('#remote-initialize-controller').show();
            }
        );
    }

    onMarkHandMounted() {
        this.handConnected = true;
        this.refreshOctoPrintStatus();
    }

    onHomeAxes() {
        $('#remote-home-octoprint').hide();
        $('.octoprint-status-status span.homed').text('homing...');
        this.remoteChess.homeAxes().then(
            () => this.refreshControllerStatus(),
            () => {
                $('.controller-status span.homed').text('error!');
                $('#remote-home-octoprint').show();
            }
        );
    }

    onGameIdSelect(e) {
        const gameId = e.currentTarget.value != GAME_ID_SELECT_DEFAULT ? e.currentTarget.value : '';
        $('#load-game-id-input')[0].value = gameId;
        this.onLoadGameButtonChange();
    }

    onGameModeRadioButtonChange(e) {
        const gameMode = e.currentTarget.value;
        if(gameMode === GAME_MODE.NETWORK) {
            $("#network-game-mode-container").show();
        } else {
            $("#network-game-mode-container").hide();
        }
    }

    onLoadGameButtonClick() {
        const gameId = $('#load-game-id-input')[0].value;
        $('#load-game-button').attr('disabled', true);
        $('#load-error').hide();
        fetchGame(gameId).then(
            (response) => {
                this.gameId = response.game_id;
                this.gameMode = response.game_mode;
                this.gameInfo.setGameId(this.gameId);
                this.gameInfo.setGameMode(this.gameMode);
                if (this.gameMode === GAME_MODE.NETWORK) {
                    if (isLoggedIn()) {
                        this.isPlayerOne = response.player_one === this.currentUser;
                        this.localPlayerSide = this.isPlayerOne ? SIDE.WHITE : SIDE.BLACK;
                        const opponent = this.isPlayerOne ? response.player_two : response.player_one;
                        this.gameInfo.setOpponent(opponent);
                    } else {
                        this.localPlayerSide = SIDE.BLACK;
                    }
                    this.gameInfo.setPlayingAs(this.localPlayerSide);
                } else {
                    this.gameInfo.setPlayingAs(null);
                }
                this.turns = _.map(response.turns, turn => ChessTurn.deserialize(turn));
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
            },
            (error) => {
                $('#load-error').text(error.responseJSON.message);
                $('#load-error').show();
                $('#load-game-button').attr('disabled', false);
            }
        );
    }

    toggleRemoteSetupContents() {
        const isVisible = $('.remote-setup-content:visible').length > 0;
        $('.remote-setup-content').toggle();
        $('#toggle-remote-setup').text(isVisible ? 'show' : 'hide');
    }

    initializedRemoteChessIfReady() {
        // DON'T LOOK AT ME, I'M HIDEOUS!
        // Yeah, ignore this. This all will be pulled out into another component and the data
        // will be managed properly there, I promise. But the UI is perfectly capable of managing state,
        // right? ... RIGHT???
        const octoprintInitialized = $('.octoprint-status .toplevel-status').textContent === 'OK';
        const controllerInitialized = $('.controller-status .toplevel-status').textContent === 'OK';
        const serverInitialized = $('.server-status .toplevel-status').textContent === 'OK';
        this.remoteChess.initialized = octoprintInitialized && controllerInitialized && serverInitialized;
    }

    onLoadGameButtonChange() {
        const gameId = $('#load-game-id-input')[0].value;
        $('#load-error').hide();
        $('#load-game-button').attr('disabled', (gameId.length < GAME_ID_LENGTH));
        $('#owned-game-id-select')[0].children[0].selected = true;
        for (let i = 0; i < $('#owned-game-id-select')[0].children.length; i++) {
            const child = $('#owned-game-id-select')[0].children[i];
            if (child.value == gameId) {
                child.selected = true;
                break;
            }
        }
        if (this.remoteChess) {
            this.initializedRemoteChessIfReady();
        }
    }

    onStartNewGameButtonClick(event) {
        const checkedItem = $('input[name="game-mode"]:checked')[0];
        $('#new-game-error').hide();
        $('.new-game-button').attr('disabled', true);

        this.gameMode = checkedItem.value;
        this.gameInfo.setGameMode(this.gameMode);

        const canHaveOpponent = isLoggedIn() && this.gameMode === GAME_MODE.NETWORK;
        const playerTwo = canHaveOpponent ? $('#network-opponent')[0].value : null;
        this.gameInfo.setOpponent(playerTwo);

        this.localPlayerSide = SIDE.WHITE;
        this.gameInfo.setPlayingAs(this.gameMode === GAME_MODE.NETWORK ? this.localPlayerSide : null);
        if (this.remoteChess) {
            this.initializedRemoteChessIfReady();
        }
        createNewGame(this.gameMode, playerTwo).then(
            (response) => {
                this.gameId = response.game_id;
                this.gameInfo.setGameId(this.gameId);
                this.initializeGame();
                this.startGame();
            },
            (error) => {
                this.gameMode = null;
                $('#new-game-error').text(error.responseJSON.message);
                $('#new-game-error').show();
                $('.new-game-button').attr('disabled', false);
            }
        );
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

                    if (this.remoteChess && this.remoteChess.initialized) {
                        this.remoteChess.processTurn(this.board, lastTurn);
                    }

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

                if (this.remoteChess && this.remoteChess.initialized) {
                    this.remoteChess.processTurn(this.board, this.currentTurn);
                }

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
