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
        headers: {
            Authorization: AUTH.getToken(),
        },
        data: JSON.stringify({
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
    return $.ajax({
        type: 'POST',
        headers: {
            Authorization: AUTH.getToken(),
        },
        data: JSON.stringify({
            distillery: distillery,
            name: name,
            current: false,
        }),
        url: getAPIUrl('whisky'),
        contentType: 'application/json',
    }).promise();
};


module.exports = {
    addWhisky,
    getCurrentShelf,
    removeWhisky,
};
