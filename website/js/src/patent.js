const $ = require('jquery');

const CONFIG = require('./config');

const patentUrl = CONFIG.LOCAL ? 'http://localhost:8099/state_check' : `https://${CONFIG.API_URL}/v1/test/state_check`;


const data = {
    state_id: 'patent_number'
};

const newRow = function(label, value) {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.innerHTML = label;
    const valueCell = document.createElement('td');
    valueCell.innerHTML = value;

    row.appendChild(labelCell);
    row.appendChild(valueCell);

    return row;
};

const updatePatentTable = function() {
    $.ajax({
        type: 'POST',
        url: patentUrl,
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
            document.getElementById('patent-state-loading').style.display = 'none';
            const table = document.getElementById('state-table');
            const patentExists = response.data.available ? ' YES!' : ' no :(';
            const status = response.data.app_status;
            const lastUpdated = response.data.last_updated;
            const patentNumber = response.data.available ? response.data.patent_number : 'not yet';

            table.appendChild(newRow('Patent exists?', patentExists));
            if (response.data.available) {
                table.appendChild(newRow('Patent number', patentNumber));
            }
            table.appendChild(newRow('Latest status', status));
            table.appendChild(newRow('Last updated', lastUpdated));
        }
    });
};

module.exports = updatePatentTable;
