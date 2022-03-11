const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');

const auth = require('./auth');
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
    initLightbox,
    initLinksTable,
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
    initChess,
    initChip8,
    initCompareACNH,
    initVillagerResults,
    initDrawJasper,
    initLightbox,
    initLinksTable,
    initMameHighscore,
    initPatent,
    initSaltLevel,
    initWhisky,
    initWhiskyShelf,
    initMultiImageContainers,
    auth,
    config,
    constants,
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
