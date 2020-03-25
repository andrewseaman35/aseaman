import React from 'react';

class ProjectCar extends React.Component {
    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    <h3>Project Car</h3>
                    <p>
                        I have a 1972 Fiat 124 Sport Spider that I've been fixing up with the goal of
                        learning how to work on cars. My plan is to update this space with some
                        of the projects and work that I've performed and things I've learned.
                    </p>
                    <p>
                        Check back later! There might be more stuff here!
                    </p>
                    <a href="index.html">Go back home</a>
                </div>
            </div>
        )
    }
}

module.exports = ProjectCar;
