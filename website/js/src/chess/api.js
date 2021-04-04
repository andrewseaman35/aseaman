import $ from 'jquery';

import { getAPIUrl } from '../utils';


function fetchGame(gameId) {
    const postData = {
        'action': 'get_game',
        'payload': {
            'game_id': gameId,
        },
    };

    return $.ajax({
        type: 'POST',
        url: getAPIUrl('chess'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}

function saveTurn(gameId, turn) {
    const postData = {
        'action': 'save_turn',
        'payload': {
            'game_id': gameId,
            'turn': turn,
        }
    };

    return $.ajax({
        type: 'POST',
        url: getAPIUrl('chess'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}

function createNewGame() {
    const postData = {
        action: 'new_game',
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('chess'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    });
}


module.exports = {
    createNewGame,
    fetchGame,
    saveTurn,
};
