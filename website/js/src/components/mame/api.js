import $ from 'jquery';

import { getAPIUrl } from '../../utils';


function getMetadata() {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('mame_highscore') + "metadata/",
        contentType: 'application/json',
    }).promise();
}

function getScoresByGameId(gameId) {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('mame_highscore') + "score/",
        data: {
            game_id: gameId,
        },
        contentType: 'application/json',
    }).promise();
}


module.exports = {
    getMetadata,
    getScoresByGameId,
};
