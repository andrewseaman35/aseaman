import $ from 'jquery';

import AUTH from '../../auth';
import { getAPIUrl } from '../../utils';

function getCurrentShelf() {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('whisky'),
        data: JSON.stringify({
            action: 'get_current_shelf'
        }),
        contentType: 'application/json',
    }).promise();
}

function addWhisky(item) {
    const {
        distillery, name, country, region, type, style, age,
    } = item;

    const postData = {
        action: 'add_to_shelf',
        api_key: AUTH.getApiKey(),
        payload: {
            distillery: distillery,
            internal_name: name,
            type: type,
            region: region,
        }
    };

    return $.ajax({
        type: 'POST',
        url: getAPIUrl('whisky'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
};

function removeWhisky(distillery, internalName) {
    console.log('removing', distillery, internalName);

    const postData = {
        action: 'remove_from_shelf',
        api_key: AUTH.getApiKey(),
        payload: {
            distillery: distillery,
            internal_name: internalName
        }
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('whisky'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
};


module.exports = {
    addWhisky,
    getCurrentShelf,
    removeWhisky,
};
