const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');
const loadGA = require('./ga');

const auth = require('./auth');
const header = require('./header');

import {
    initAbout,
    initPatent,
    initProjectCar,
    initProjectCarCoolingSystem,
    initProjectCarTestThermo,
    initWhisky,
} from './entry';

import {
    initWhiskyShelf,
} from './components';

const modules = {
    initAbout,
    initPatent,
    initProjectCar,
    initProjectCarCoolingSystem,
    initProjectCarTestThermo,
    initWhisky,
    initWhiskyShelf,
    auth,
    config,
    constants,
    header,
    utils,
};

$(window).ready(function() {
    loadGA();
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }
});

