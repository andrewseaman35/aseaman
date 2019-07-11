const $ = require('jquery');

const CONFIG = require('./config');

const data = {
    action: 'get_current_shelf'
};

const headerRow = function() {
    const row = document.createElement('tr');
    const distilleryCell = document.createElement('th');
    distilleryCell.innerHTML = 'Distillery';
    const nameCell = document.createElement('th');
    nameCell.innerHTML = 'Name (internal)';
    row.appendChild(distilleryCell);
    row.appendChild(nameCell);

    return row;
};

const newRow = function(whisky) {
    const row = document.createElement('tr');
    const distilleryCell = document.createElement('td');
    distilleryCell.innerHTML = whisky.distillery;
    const internalNameCell = document.createElement('td');
    internalNameCell.innerHTML = whisky.internal_name;

    row.appendChild(distilleryCell);
    row.appendChild(internalNameCell);

    return row;
};

const getCurrentShelf = function() {
    const whiskyApiUrl = `https://${CONFIG.API_ID}.execute-api.us-east-1.amazonaws.com/test/whisky`;
    $.post(
        whiskyApiUrl,
        JSON.stringify(data),
        function(whiskies) {
            document.getElementById('whisky-shelf-loading').style.display = 'none';
            const table = document.getElementById('whisky-shelf-table');

            table.appendChild(headerRow());
            whiskies.forEach(function (whisky) {
                const row = newRow(whisky);
                table.appendChild(row);
            });
        }
    );
};

const addToShelf = function() {
    const whiskyApiUrl = `https://${CONFIG.API_ID}.execute-api.us-east-1.amazonaws.com/test/whisky`;
    const postData = {
        action: 'add_to_shelf',
        distillery: 'Lagavulin',
        internal_name: '16'
    };
    $.post(
        whiskyApiUrl,
        JSON.stringify(postData),
        function() {
            const table = document.getElementById('whisky-shelf-table');
            const row = newRow(postData);
            table.appendChild(row);
        }
    );
};

const initWhiskyShelf = function() {
    getCurrentShelf();
    document.getElementById('js-add').addEventListener('click', function() {
        addToShelf();
    });
};

module.exports = initWhiskyShelf;
