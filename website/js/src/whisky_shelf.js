const $ = require('jquery');

const CONFIG = require('./config');
const AUTH = require('./auth');

const whiskyApiUrl = CONFIG.LOCAL ? 'http://0.0.0.0:8099/whisky' : `https://${CONFIG.API_URL}/v1/test/whisky`;

let currentWhiskies;

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
    if (AUTH.getApiKey()) {
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'X';
        deleteButton.addEventListener('click', function() {
            removeFromShelf(whisky.distillery, whisky.internal_name);
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);
    }

    return row;
};

const inputRow = function() {
    const row = document.createElement('tr');
    const distilleryCell = document.createElement('td');
    const distilleryInput = document.createElement('input');
    distilleryInput.id = 'distillery-input';
    distilleryCell.appendChild(distilleryInput);

    const internalNameCell = document.createElement('td');
    const internalNameInput = document.createElement('input');
    internalNameInput.id = 'internal-name-input';
    internalNameCell.appendChild(internalNameInput);

    const regionCell = document.createElement('td');
    const regionInput = document.createElement('input');
    regionInput.id = 'region-input';
    regionCell.appendChild(regionInput);

    const typeCell = document.createElement('td');
    const typeInput = document.createElement('input');
    typeInput.id = 'type-input';
    typeCell.appendChild(typeInput);

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
            currentWhiskies = whiskies;
            renderWhiskyTable(currentWhiskies);
        }
    });
};

const addToShelf = function(distillery, internalName, type, region) {
    const postData = {
        action: 'add_to_shelf',
        api_key: AUTH.getApiKey(),
        payload: {
            distillery: distillery,
            internal_name: internalName
        }
    };
    $.ajax({
        type: 'POST',
        url: whiskyApiUrl,
        data: JSON.stringify(postData),
        contentType: 'application/json',
        success: function() {
            currentWhiskies.push({distillery: distillery, internal_name: internalName});
            renderWhiskyTable(currentWhiskies);
        }
    });
};

const removeFromShelf = function(distillery, internalName) {
    console.log(distillery, internalName);
    const postData = {
        action: 'remove_from_shelf',
        api_key: AUTH.getApiKey(),
        payload: {
            distillery: distillery,
            internal_name: internalName
        }
    };
    $.ajax({
        type: 'POST',
        url: whiskyApiUrl,
        data: JSON.stringify(postData),
        contentType: 'application/json',
        success: function() {
            currentWhiskies = currentWhiskies.filter(function(whisky) {return whisky.distiller !== distillery && whisky.internal_name !== internalName;});
            renderWhiskyTable(currentWhiskies);
        }
    });
};

const renderWhiskyTable = function(whiskies) {
    document.getElementById('whisky-shelf-loading').style.display = 'none';
    const table = document.getElementById('whisky-shelf-table');
    table.innerHTML = '';

    table.appendChild(headerRow());
    whiskies.sort(function(a, b) {
        if(a.distillery < b.distillery) { return -1; }
        return 1;
    });

    whiskies.forEach(function (whisky) {
        const row = newRow(whisky);
        table.appendChild(row);
    });
    if (AUTH.getApiKey()) {
        table.appendChild(inputRow());

        const addButtonRow = document.createElement('tr');
        const addButtonCell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.innerHTML = 'add';
        addButton.addEventListener('click', function() {
            const distillery = document.getElementById('distillery-input').value;
            const internalName = document.getElementById('internal-name-input').value;
            const type = document.getElementById('type-input').value;
            const region = document.getElementById('region-input').value;
            if (distillery && internalName && type && region) {
                addToShelf(distillery, internalName, type, region);
            }

        });
        addButtonCell.appendChild(addButton);
        addButtonRow.appendChild(addButtonCell);
        table.appendChild(addButtonRow);
    }
};

const initWhiskyShelf = function() {
    getCurrentShelf();
};

module.exports = initWhiskyShelf;
