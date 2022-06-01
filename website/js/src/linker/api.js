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


function saveUserLink(linkData) {
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


module.exports = {
    loadUserLinks,
    saveUserLink,
 };
