import $ from 'jquery';


import { isLoggedIn } from '../auth';
import {
    GAME_MODE,
} from './constants';


import ChessGame from './game';
import RemoteChess from './remoteChess';

import {
    createNewGame,
    loadUserGames,
    fetchGame,
} from  './api';

const GAME_ID_LENGTH = 6;
const GAME_ID_SELECT_DEFAULT = 'default'



class ChessCoordinator {
    constructor() {
        console.log("coordinator")
        this.handConnected = false;

        this.game = new ChessGame();
        this.remoteChess = new RemoteChess();
    }

    initialize() {
        this.game.setOnTurnHandler((board, turn) => this.onTurn(board, turn));
        this.initializeGameStartModal();
        this.initializeRemoteChess();
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
        $('.board-setup-container').show();
        $('.remote-setup-container').show();
        $('#toggle-board-setup').on('click', () => this.toggleBoardSetupContents());
        $('#toggle-remote-setup').on('click', () => this.toggleRemoteSetupContents());
        $('#remote-initialize-controller').on('click', () => this.onInitializeController());
        $('#remote-initialize-octoprint').on('click', () => this.onInitializeOctoPrint());
        $('#remote-refresh-octoprint').on('click', () => this.refreshOctoPrintStatus());
        $('#remote-refresh-controller').on('click', () => this.refreshControllerStatus());
        $('#remote-home-octoprint').on('click', () => this.onHomeAxes());
        $('#remote-hand-connected-octoprint').on('click', () => this.onMarkHandMounted());

        this.refreshServerStatus();
        this.refreshOctoPrintStatus();
        this.refreshControllerStatus();
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

    toggleBoardSetupContents() {
        const isVisible = $('.board-setup-content:visible').length > 0;
        $('.board-setup-content').toggle();
        $('#toggle-board-setup').text(isVisible ? 'show' : 'hide');
    }

    toggleRemoteSetupContents() {
        const isVisible = $('.remote-setup-content:visible').length > 0;
        $('.remote-setup-content').toggle();
        $('#toggle-remote-setup').text(isVisible ? 'show' : 'hide');
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

    onMarkHandMounted() {
        this.handConnected = true;
        this.refreshOctoPrintStatus();
    }

    onStartNewGameButtonClick() {
        const checkedItem = $('input[name="game-mode"]:checked')[0];
        const ranks = Number($('#board-ranks-input')[0].value);
        const files = Number($('#board-files-input')[0].value);
        console.log(ranks)
        $('#new-game-error').hide();
        $('.new-game-button').attr('disabled', true);

        const gameMode = checkedItem.value;
        const canHaveOpponent = isLoggedIn() && gameMode === GAME_MODE.NETWORK;
        const playerTwo = canHaveOpponent ? $('#network-opponent')[0].value : null;

        if (this.remoteChess) {
            this.initializedRemoteChessIfReady();
        }
        createNewGame(gameMode, playerTwo).then(
            (response) => {
                this.game.newGame({
                    id: response.game_id,
                    mode: gameMode,
                    playerTwo: playerTwo,
                    ranks: ranks,
                    files: files,
                });
            },
            (error) => {
                this.gameMode = null;
                $('#new-game-error').text(error.responseJSON.message);
                $('#new-game-error').show();
                $('.new-game-button').attr('disabled', false);
            }
        );
    }

    onLoadGameButtonClick() {
        const gameId = $('#load-game-id-input')[0].value;
        $('#load-game-button').attr('disabled', true);
        $('#load-error').hide();
        fetchGame(gameId).then(
            (response) => {
                this.game.loadGame({
                    id: response.game_id,
                    mode: response.game_mode,
                    playerOne: response.player_one,
                    playerTwo: response.player_two,
                    turns: response.turns,
                });
            },
            (error) => {
                $('#load-error').text(error.responseJSON.message);
                $('#load-error').show();
                $('#load-game-button').attr('disabled', false);
            }
        );
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
            this.game.initializedRemoteChessIfReady();
        }
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

    onTurn(board, turn) {
        if (this.remoteChess && this.remoteChess.initialized) {
            this.remoteChess.processTurn(board, turn);
        }
    }

}

module.exports = ChessCoordinator
