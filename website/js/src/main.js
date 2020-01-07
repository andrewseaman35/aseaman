const $ = require('jquery');

const config = require('./config');
const constants = require('./constants');
const utils = require('./utils');
const loadGA = require('./ga');

const auth = require('./auth');
const header = require('./header');

const whiskyShelf = require('./whisky_shelf');

import {
    initAbout,
    initPatent,
} from './entry';

import {
    initFooter,
    initWhiskyShelf,
} from './components';

const modules = {
    initAbout,
    initPatent,
    initWhiskyShelf,
    auth,
    config,
    constants,
    header,
    whiskyShelf,
    utils,
};

$(window).ready(function() {
    loadGA();
    for (const i in window.aseaman._js) {
        window.aseaman._js[i](modules);
    }

    // `footer-container` is the id of the footer container defined in `base.jinja2`
    initFooter('footer-container');
});

