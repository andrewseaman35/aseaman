const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');

const auth = require('./auth');
const header = require('./header');
const initMultiImageContainers = require('./multiImageContainer');

import {
    initACNHRankings,
    initCompareACNH,
    initVillagerResults,
    initDrawJasper,
    initLightbox,
    initMameHighscore,
    initPatent,
    initSaltLevel,
    initWhisky,
} from './entry';

import {
    initWhiskyShelf,
} from './components';

const modules = {
    initACNHRankings,
    initCompareACNH,
    initVillagerResults,
    initDrawJasper,
    initLightbox,
    initMameHighscore,
    initPatent,
    initSaltLevel,
    initWhisky,
    initWhiskyShelf,
    initMultiImageContainers,
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
    initLightbox();
});

