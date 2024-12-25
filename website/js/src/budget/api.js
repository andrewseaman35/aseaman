import $ from 'jquery';

import { getToken } from '../auth';
import { getAPIUrl } from '../utils';


function fetchEntries(options) {
    const queryParams = {};
    if (options.year != null) {
        queryParams.year = options.year;
    }
    queryParams.year = 2024
    const params  =new URLSearchParams(queryParams).toString()

    return $.ajax({
        type: 'GET',
        url: getAPIUrl('budget') + `entry/?${params}`,
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
    }).promise();
}

export {
    fetchEntries
}