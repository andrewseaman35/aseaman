import $ from 'jquery';

import { getAPIUrl } from '../../utils';


function getMetadata() {
    const postData = {
        action: 'metadata',
        payload: {},
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('mame_highscore'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}

function getScoresByGameId(gameId) {
    const postData = {
        action: 'get_by_game_id',
        payload: {
            game_id: gameId,
        }
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('mame_highscore'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}


module.exports = {
    getMetadata,
    getScoresByGameId,
};
