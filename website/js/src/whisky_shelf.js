const $ = require('jquery');

const CONFIG = require('./config');

const whiskyApiUrl = CONFIG.LOCAL ? 'http://0.0.0.0:8099/whisky' : `https://${CONFIG.API_URL}/v1/test/whisky`;

const headerRow = function() {
    const row = document.createElement('tr');
    const distilleryCell = document.createElement('th');
    distilleryCell.innerHTML = 'Distillery';
    const nameCell = document.createElement('th');
    nameCell.innerHTML = 'Name (internal)';
    const typeCell = document.createElement('th');
    typeCell.innerHTML = 'Type';
    const regionCell = document.createElement('th');
    regionCell.innerHTML = 'Region';
    row.appendChild(distilleryCell);
    row.appendChild(nameCell);
    row.appendChild(typeCell);
    row.appendChild(regionCell);

    return row;
};

const newRow = function(whisky) {
    const row = document.createElement('tr');
    const distilleryCell = document.createElement('td');
    distilleryCell.innerHTML = whisky.distillery;
    const internalNameCell = document.createElement('td');
    internalNameCell.innerHTML = whisky.internal_name;

    const regionCell = document.createElement('td');
    regionCell.innerHTML = whisky.region || '';

    const typeCell = document.createElement('td');
    typeCell.innerHTML = whisky.type || '';

    row.appendChild(distilleryCell);
    row.appendChild(internalNameCell);
    row.appendChild(typeCell);
    row.appendChild(regionCell);

    return row;
};

const getCurrentShelf = function() {
    $.ajax({
        type: 'POST',
        url: whiskyApiUrl,
        data: JSON.stringify({
            action: 'get_current_shelf'
        }),
        contentType: 'application/json',
        success: function(whiskies) {
            document.getElementById('whisky-shelf-loading').style.display = 'none';
            const table = document.getElementById('whisky-shelf-table');

            table.appendChild(headerRow());
            whiskies.sort(function(a, b) {
                if(a.distillery < b.distillery) { return -1; }
                return 1;
            });

            whiskies.forEach(function (whisky) {
                const row = newRow(whisky);
                table.appendChild(row);
            });
        }
    });
};

const addToShelf = function() {
    const postData = {
        action: 'add_to_shelf',
        distillery: 'Lagavulin',
        internal_name: '16'
    };
    $.ajax({
        type: 'POST',
        url: whiskyApiUrl,
        data: JSON.stringify(postData),
        contentType: 'application/json',
        success: function() {
            const table = document.getElementById('whisky-shelf-table');
            const row = newRow(postData);
            table.appendChild(row);
        }
    });
};

const initWhiskyShelf = function() {
    getCurrentShelf();
    // document.getElementById('js-add').addEventListener('click', function() {
    //     addToShelf();
    // });
};

module.exports = initWhiskyShelf;
