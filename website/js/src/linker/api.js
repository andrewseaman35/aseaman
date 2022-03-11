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


module.exports = {
    loadUserLinks
 };
