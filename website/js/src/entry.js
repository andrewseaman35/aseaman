import React from 'react';
import ReactDOM from 'react-dom';

import { ACNHRankings, CompareACNH, VillagerResults } from './compare_acnh';
import DrawJasper from './DrawJasper';
import MameHighscore from './MameHighscore';
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

function initCompareACNH(elementId) {
    ReactDOM.render(
        <CompareACNH />,
        document.getElementById(elementId),
    );
}

function initACNHRankings(elementId) {
    ReactDOM.render(
        <ACNHRankings />,
        document.getElementById(elementId),
    );
}

function initVillagerResults(elementId) {
    ReactDOM.render(
        <VillagerResults />,
        document.getElementById(elementId),
    );
}

function initDrawJasper(elementId) {
    ReactDOM.render(
        <DrawJasper />,
        document.getElementById(elementId),
    );
}

function initMameHighscore(elementId) {
    ReactDOM.render(
        <MameHighscore />,
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
    initACNHRankings,
    initCompareACNH,
    initVillagerResults,
    initDrawJasper,
    initLightbox,
    initMameHighscore,
    initPatent,
    initSaltLevel,
    initWhisky,
};
