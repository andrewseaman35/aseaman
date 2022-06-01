import $ from 'jquery';

import { getToken } from '../auth';
import { getAPIUrl } from '../utils';

function loadUserLinks() {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('linker'),
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
    }).promise();
}


function updateUserLink(linkData) {
    return $.ajax({
        type: 'PUT',
        url: getAPIUrl('linker'),
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
        data: JSON.stringify(linkData),
    }).promise();
}

function saveNewUserLink(linkData) {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('linker'),
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
        data: JSON.stringify(linkData),
    })
}

module.exports = {
    loadUserLinks,
    saveNewUserLink,
    updateUserLink,
 };
