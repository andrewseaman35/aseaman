import React from 'react';

import { getImageSrc } from './utils';

class ProjectCar extends React.Component {
    render() {
        return (
            <div>
                <h1>Project Car</h1>
                <p>
                    I have a 1972 Fiat 124 Sport Spider that I've been fixing up with the goal of
                    learning how to work on cars. My plan is to update this space with some
                    of the projects and work that I've performed and things I've learned.
                </p>
                <div className="list">
                    <div className="list-header">Projects</div>
                    <ul>
                        <li><a href="/project_car/cooling_system.html">Cooling system replacement</a></li>
                        <li><a href="/project_car/test_thermo.html">Testing the thermostat</a></li>
                        <li>More coming soon!</li>
                    </ul>
                </div>
                <div className="img-container">
                    <img src={getImageSrc('images/project_car/fiat-front.jpg')}></img>
                </div>
                <a href="index.html">Go back home</a>
            </div>
        )
    }
}

module.exports = ProjectCar;
