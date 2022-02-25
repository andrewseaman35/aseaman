import $ from 'jquery';

import { getToken } from '../auth';
import { getAPIUrl } from '../utils';


function fetchGame(gameId) {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('chess') + "game/",
        data: {
            'game_id': gameId,
        },
        contentType: 'application/json',
    }).promise();
}

function saveTurn(gameId, turn) {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('chess') + "turn/",
        data: JSON.stringify({
            'game_id': gameId,
            'turn': turn,
        }),
        contentType: 'application/json',
    }).promise();
}

function createNewGame(gameMode) {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('chess') + "game/",
        headers: {
            Authorization: getToken(),
        },
        data: JSON.stringify({
            'game_mode': gameMode,
        }),
        contentType: 'application/json',
    });
}

function loadUserGames() {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('chess') + "game/",
        headers: {
            Authorization: getToken(),
        },
        data: {
            'current_user': true
        },
        contentType: 'application/json',
    });
}


module.exports = {
    createNewGame,
    fetchGame,
    saveTurn,
    loadUserGames,
};
