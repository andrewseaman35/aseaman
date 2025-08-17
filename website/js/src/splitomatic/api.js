import $ from 'jquery';

import { getAPIUrl } from '../utils';
import { getToken } from '../auth';

function createEvent({eventName, users}) {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('splitomatic/event'),
        contentType: 'application/json',
        headers: {
            Authorization: getToken(),
        },
        data: JSON.stringify({
            name: eventName,
            users: users.join(','),
        }),
    }).promise();
}

function uploadReceipt(eventId, content, filetype) {
    console.log("Uploading receipt for event:", eventId);
    return $.ajax({
        url: getAPIUrl(`splitomatic/receipt_upload/${eventId}`),
        type: "POST",
        headers: {
            Authorization: getToken(),
        },
        contentType: filetype,
        data: content,
        processData: false,
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
    uploadReceipt,
};
