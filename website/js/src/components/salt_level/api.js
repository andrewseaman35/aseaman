import $ from 'jquery';

import { getAPIUrl } from '../../utils';

function list(water_softener_id) {
    const payload = {};
    if (water_softener_id) {
        payload.water_softener_id = water_softener_id
    }
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('salt_level'),
    }).promise();
}

module.exports = {
    list,
};
