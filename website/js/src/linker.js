import $ from 'jquery';

import { getToken } from './auth';
import { getAPIUrl } from './utils';

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

const link = function() {
    const url = window.location.href;
    const splitUrl = url.split('#');

    if (splitUrl.length !== 2) {
        window.location.replace('/index');
    }

    const linkId = splitUrl[1];
    fetchLink(linkId).then((result) => {
        window.location.replace(result.url);
    }, () => {
        window.location.replace('/404')
    })
};


module.exports = {
    link
 };
