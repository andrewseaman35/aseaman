const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');
const loadGA = require('./ga');

const initLogin = require('./login');
const auth = require('./auth');

const patent = require('./patent');

const modules = {
    auth,
    config,
    constants,
    patent,
    utils,
};

$(window).ready(function() {
    loadGA();
    initLogin();
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }
});

