import $ from 'jquery';

import { getAPIUrl } from '../utils';
import { getToken } from '../auth';

function createEvent() {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('splitomatic/event'),
        contentType: 'application/json',
        headers: {
            Authorization: getToken(),
        },
        data: JSON.stringify({}),
    }).promise();
}

function fetchEvent(eventId) {
    const payload = {};
    if (eventId) {
        payload.id = eventId
    }
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('splitomatic/event'),
        data: payload,
    }).promise();
}

module.exports = {
    createEvent,
    fetchEvent,
};
