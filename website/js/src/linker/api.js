import $ from 'jquery';

import { getToken } from '../auth';
import { getAPIUrl } from '../utils';


function fetchLink(id) {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('linker'),
        headers: {
            Authorization: getToken(),
        },
        data: {
            'id': id,
        },
        contentType: 'application/json',
    }).promise();
}

function loadUserLinks(options) {
    options = options || {};
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('linker'),
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
        data: options,
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

function deleteUserLink(key) {
    return $.ajax({
        type: 'DELETE',
        url: getAPIUrl('linker') + `?id=${key}`,
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
    })
}

module.exports = {
    deleteUserLink,
    fetchLink,
    loadUserLinks,
    saveNewUserLink,
    updateUserLink,
 };
