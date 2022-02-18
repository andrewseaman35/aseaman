import $ from 'jquery';

import AUTH from '../../auth';
import { getAPIUrl } from '../../utils';

function getCurrentShelf() {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('whisky'),
        contentType: 'application/json',
    }).promise();
}

function addWhisky(item) {
    const {
        distillery, name, country, region, type, style, age,
    } = item;

    return $.ajax({
        type: 'POST',
        url: getAPIUrl('whisky'),
        data: JSON.stringify({
            api_key: AUTH.getApiKey(),
            distillery: distillery,
            name: name,
            type: type,
            region: region,
            country: country,
            style: style,
            age: age,
        }),
        contentType: 'application/json',
    }).promise();
};

function removeWhisky(distillery, name) {
    const queryString = $.param({
        distillery: distillery,
        name: name,
        api_key: AUTH.getApiKey(),
    })
    return $.ajax({
        type: 'DELETE',
        url: getAPIUrl('whisky') + `?${queryString}`,
        contentType: 'application/json',
    }).promise();
};


module.exports = {
    addWhisky,
    getCurrentShelf,
    removeWhisky,
};
