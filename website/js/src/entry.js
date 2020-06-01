import React from 'react';
import ReactDOM from 'react-dom';

import DrawJasper from './DrawJasper';
import Patent from './Patent';
import SaltLevel from './SaltLevel';
import Whisky from './Whisky';

import Lightbox from './components/Lightbox';

function initLightbox() {
    ReactDOM.render(
        <Lightbox />,
        document.getElementById('lightbox'),
    );
}

function initDrawJasper(elementId) {
    ReactDOM.render(
        <DrawJasper />,
        document.getElementById(elementId),
    );
}


function initPatent(elementId) {
    ReactDOM.render(
        <Patent />,
        document.getElementById(elementId),
    );
}


function initWhisky(elementId) {
    ReactDOM.render(
        <Whisky />,
        document.getElementById(elementId),
    );
}


function initSaltLevel(elementId) {
    ReactDOM.render(
        <SaltLevel />,
        document.getElementById(elementId),
    );
}


module.exports = {
    initDrawJasper,
    initLightbox,
    initPatent,
    initSaltLevel,
    initWhisky,
};
