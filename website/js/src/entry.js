import React from 'react';
import ReactDOM from 'react-dom';

import About from './About';
import Patent from './Patent';
import ProjectCarCoolingSystem from './project_car/ProjectCarCoolingSystem'
import ProjectCarTestThermo from './project_car/ProjectCarTestThermo'
import Whisky from './Whisky';


function initAbout(elementId) {
    ReactDOM.render(
        <About />,
        document.getElementById(elementId),
    );
}


function initPatent(elementId) {
    ReactDOM.render(
        <Patent />,
        document.getElementById(elementId),
    );
}


function initProjectCarCoolingSystem(elementId) {
    ReactDOM.render(
        <ProjectCarCoolingSystem />,
        document.getElementById(elementId),
    );
}


function initProjectCarTestThermo(elementId) {
    ReactDOM.render(
        <ProjectCarTestThermo />,
        document.getElementById(elementId),
    );
}


function initWhisky(elementId) {
    ReactDOM.render(
        <Whisky />,
        document.getElementById(elementId),
    );
}

module.exports = {
    initAbout,
    initPatent,
    initProjectCarCoolingSystem,
    initProjectCarTestThermo,
    initWhisky,
};
