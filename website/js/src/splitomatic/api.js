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

function fetchReceipt(eventId, receiptId) {
    const payload = {
        event_id: eventId,
        id: receiptId,
    };
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('splitomatic/receipt'),
        data: payload,
    }).promise();
}

function fetchSummary(userId, eventId) {
    const payload = {
        event_id: eventId,
        user_id: userId,
    };
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('splitomatic/summary'),
        data: payload,
    }).promise();
}

function claimItem(receiptId, itemId, userId, claim) {
    const payload = {
        receipt_id: receiptId,
        item_id: itemId,
        user_id: userId,
        claim: claim,
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('splitomatic/claim'),
        contentType: 'application/json',
        data: JSON.stringify(payload),
    }).promise();
}

module.exports = {
    createEvent,
    fetchEvent,
    uploadReceipt,
    fetchReceipt,
    claimItem,
    fetchSummary,
};
