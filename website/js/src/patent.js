const $ = require('jquery');

const CONFIG = require('./config');

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
    const patentUrl = `https://${CONFIG.API_ID}.execute-api.us-east-1.amazonaws.com/test/state_check`;
    $.post(
        patentUrl,
        JSON.stringify(data),
        function(response) {
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
    );
};

module.exports = updatePatentTable;
