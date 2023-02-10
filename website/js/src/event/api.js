import $ from 'jquery';

import { getAPIUrl } from '../utils';


function trackEvent(eventType, eventId) {
    return $.ajax({
        type: 'GET',
        url: `${getAPIUrl('event')}${eventType}/`,
        data: {
            event_id: eventId,
        },
        contentType: 'application/json',
    }).promise();
}


module.exports = {
    trackEvent,
 };
