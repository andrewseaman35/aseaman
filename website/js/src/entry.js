import React from 'react';
import ReactDOM from 'react-dom';

import { ACNHRankings, CompareACNH, VillagerResults } from './compare_acnh';
import DrawJasper from './DrawJasper';
import BudgetPage from './budget/index';
import LinksTable from './linker/LinksTable';
import MameHighscore from './MameHighscore';
import SaltLevel from './SaltLevel';
import Splitomatic from './splitomatic/Splitomatic';

import Lightbox from './components/Lightbox';
import Navigation from './components/navigation/Navigation';

function initLightbox() {
    ReactDOM.render(
        <Lightbox />,
        document.getElementById('lightbox'),
    );
}


function initSplitomatic(elementId) {
    ReactDOM.render(
        <Splitomatic />,
        document.getElementById(elementId),
    );
}


function initNavigation() {
    ReactDOM.render(
        <Navigation />,
        document.getElementById('site-navigation'),
    )
}


function initLinksTable(containerId) {
    ReactDOM.render(
        <LinksTable />,
        document.getElementById(containerId),
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


function initSaltLevel(elementId) {
    ReactDOM.render(
        <SaltLevel />,
        document.getElementById(elementId),
    );
}


function initBudgetPage(elementId) {
    ReactDOM.render(
        <BudgetPage />,
        document.getElementById(elementId),
    );
}


module.exports = {
    initACNHRankings,
    initCompareACNH,
    initVillagerResults,
    initLinksTable,
    initBudgetPage,
    initDrawJasper,
    initLightbox,
    initMameHighscore,
    initNavigation,
    initSaltLevel,
    initSplitomatic,
};
