import $ from 'jquery';

import { getToken } from '../auth';
import { getAPIUrl } from '../utils';


function fetchConfig() {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('budget/config'),
        headers: {
            Authorization: getToken(),
        },
        contentType: 'application/json',
    }).promise();
}


function fetchEntries(options) {
    const queryParams = {};
    if (options.transaction_year != null) {
        queryParams.transaction_year = options.transaction_year;
    }
    if (options.transaction_month != null) {
        queryParams.transaction_month = options.transaction_month;
    }
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
    fetchConfig,
    fetchEntries,
}