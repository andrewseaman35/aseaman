import $ from 'jquery';

import { getAPIUrl } from '../../utils';

function list(water_softener_id) {
    const payload = {};
    if (water_softener_id) {
        payload.water_softener_id = water_softener_id
    }
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('salt_level'),
        data: JSON.stringify({
            action: 'list',
            payload: payload,
        }),
        contentType: 'application/json',
    }).promise();
}

module.exports = {
    list,
};
