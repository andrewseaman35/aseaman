import $ from 'jquery';

import { getAPIUrl } from '../utils';


function fetchAllSummaries() {
    const postData = {
        action: 'all_summary_items',
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('compare_acnh'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}

function fetchVillagerSummaries(villagerIds) {
    const postData = {
        action: 'get_summary_items',
        payload: {
            villager_ids: villagerIds,
        },
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('compare_acnh'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}

function fetchVillagerResults(villagerId) {
    const postData = {
        action: 'results',
        payload: {
            villager_id: villagerId,
        },
    };
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('compare_acnh'),
        data: JSON.stringify(postData),
        contentType: 'application/json',
    }).promise();
}

module.exports = {
    fetchAllSummaries,
    fetchVillagerSummaries,
    fetchVillagerResults,
}
