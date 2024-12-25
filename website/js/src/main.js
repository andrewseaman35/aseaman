const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');

const auth = require('./auth');
const event = require('./event');
const header = require('./header');
const initMultiImageContainers = require('./multiImageContainer');
const linker = require('./linker');
import {
    initChip8,
} from './chip8';
import {
    initChess,
} from './chess';

import {
    initACNHRankings,
    initCompareACNH,
    initVillagerResults,
    initDrawJasper,
    initBudgetPage,
    initLightbox,
    initLinksTable,
    initMameHighscore,
    initSaltLevel,
} from './entry';

const modules = {
    initACNHRankings,
    initChess,
    initChip8,
    initCompareACNH,
    initVillagerResults,
    initDrawJasper,
    initBudgetPage,
    initLightbox,
    initLinksTable,
    initMameHighscore,
    initSaltLevel,
    initMultiImageContainers,
    auth,
    config,
    constants,
    event,
    linker,
    header,
    utils,
};

$(window).ready(function() {
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }
    initLightbox();
});
