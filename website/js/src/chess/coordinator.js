import $ from 'jquery';


import { isLoggedIn } from '../auth';
import {
    GAME_MODE,
} from './constants';


import ChessGame from './game';

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
        this.game = new ChessGame()

        this.initializeGameStartModal();
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

    onStartNewGameButtonClick() {
        const checkedItem = $('input[name="game-mode"]:checked')[0];
        $('#new-game-error').hide();
        $('.new-game-button').attr('disabled', true);

        const gameMode = checkedItem.value;
        const canHaveOpponent = isLoggedIn() && gameMode === GAME_MODE.NETWORK;
        const playerTwo = canHaveOpponent ? $('#network-opponent')[0].value : null;

        if (this.game.remoteChess) {
            this.game.initializedRemoteChessIfReady();
        }
        createNewGame(gameMode, playerTwo).then(
            (response) => {
                this.game.newGame({
                    id: response.game_id,
                    mode: gameMode,
                    playerTwo: playerTwo,
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
        if (this.game.remoteChess) {
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

}

module.exports = ChessCoordinator
