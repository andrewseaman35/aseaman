import React from 'react';

import { getImageSrc } from '../utils';


class ProjectCarTestThermo extends React.Component {
    render() {
        return (
            <div>
                <div className="project-header">
                    <h1>Project Car</h1>
                    <h2>Project: Testing the Thermostat</h2>
                </div>
                <p>
                    While performing the <a href="/project_car_cooling_system.html">
                    cooling system replacement</a>, I removed the cooling system thermostat and
                    housing in order to test it. I wanted to make sure that it was functioning
                    properly as a part of the cooling system replacement.
                </p>
                <p>
                    The thermostat plays a very important role in the cooling system. It's a little
                    valve in a three way junction that controls the flow of the coolant. When the
                    coolant flowing through the thermostat housing is below a certain temperature,
                    the valve stays closed and the coolant bypasses the radiator. As the engine
                    temperature increases, the coolant temperature will increase along with it. Once
                    it surpasses that certain temperature, the thermostat valve will open, allowing
                    the coolant to flow through the radiator enabling it to cool more quickly.
                </p>
                <p>
                    An easy way to test the thermostat is to put in in some water that's heated on
                    a stove. The valve in the thermostat should start closed, but once the water
                    passes that temperature, you should be able to see it physically open.
                </p>
                <p>
                    I stuck a pot on a hot plate and dropped the thermostat and housing into the pot.
                    You can take it out of the housing, which would make it easier, but I didn't. I also
                    had a kitchen thermometer with me to track the temperature of the water to ensure that
                    it opens within the spec. I wanted to put the spec here, but I don't have my manual
                    as I'm writing this. Hopefully, I'll remember to come back and update it.
                </p>
                <div className="img-container">
                    <img
                        src={getImageSrc('images/project_car/cooling_system/thermostat_test.jpg')}
                        alt="Thermostat in pot on hot plate"
                    ></img>
                    <div className="img-caption">Starting to test the thermostat</div>
                </div>
                <p>
                    I tracked the temperature of the water and made sure that the valve opened at a
                    temperature within the spec. The image below shows a comparison of the thermostat
                    before and after the test.
                </p>
                <div className="img-container">
                    <img
                        src={getImageSrc('images/project_car/cooling_system/thermo_comparison.png')}
                        alt="Thermostat comparison before and after test"
                    ></img>
                    <div className="img-caption">Cold thermostat on left, hot on right</div>
                </div>
                <p>
                    You can see that the valve on the right (post-heat) is opened a little bit, meaning that
                    it's working properly. There's also a spec for how much it should open, so I measured the
                    width of the opening and confirmed that as well. Once this was done, I could confidently
                    put it back in the car to to finish off the <a href="/project_car_cooling_system.html">
                    cooling system replacement</a>!
                </p>

                <p className="still-interested"><strong>
                    Still interested? Go back to the <a href="/project_car.html">Project Car page</a> and check out
                    something else I've done!
                </strong></p>
            </div>
        )
    }
}

module.exports = ProjectCarTestThermo;
