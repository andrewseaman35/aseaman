const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');

const auth = require('./auth');
const header = require('./header');

import {
    initDrawJasper,
    initPatent,
    initSaltLevel,
    initWhisky,
} from './entry';

import {
    initWhiskyShelf,
} from './components';

const modules = {
    initDrawJasper,
    initPatent,
    initSaltLevel,
    initWhisky,
    initWhiskyShelf,
    auth,
    config,
    constants,
    header,
    utils,
};

$(window).ready(function() {
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }
});

