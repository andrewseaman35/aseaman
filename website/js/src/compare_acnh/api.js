import $ from 'jquery';

import { getAPIUrl } from '../utils';


function fetchAllSummaries() {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('compare_acnh') + "summary/",
        contentType: 'application/json',
    }).promise();
}

function fetchVillagerSummaries(villagerIds) {
    var data = $.param({ villager_id: villagerIds }, true);
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('compare_acnh'),
        data: data,
        contentType: 'application/json',
    }).promise();
}

function fetchVillagerResults(villagerId) {
    return $.ajax({
        type: 'GET',
        url: getAPIUrl('compare_acnh') + "result/",
        data: { villager_id: villagerId },
        contentType: 'application/json',
    }).promise();
}

function submitResult(winnerId, loserId) {
    return $.ajax({
        type: 'POST',
        url: getAPIUrl('compare_acnh') + "result/",
        data: JSON.stringify({
            winnerId: winnerId,
            loserId: loserId,
        }),
        contentType: 'application/json',
    }).promise();
}

module.exports = {
    fetchAllSummaries,
    fetchVillagerSummaries,
    fetchVillagerResults,
    submitResult,
}
