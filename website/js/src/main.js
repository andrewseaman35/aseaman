const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');
const loadGA = require('./ga');

const auth = require('./auth');
const header = require('./header');

const patent = require('./patent');
const whiskyShelf = require('./whisky_shelf');

const modules = {
    auth,
    config,
    constants,
    header,
    patent,
    whiskyShelf,
    utils,
};

$(window).ready(function() {
    loadGA();
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }
});

