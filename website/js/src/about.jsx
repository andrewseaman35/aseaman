import React from 'react';
import ReactDOM from 'react-dom';

class About extends React.Component {
    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    <h3>What is this?</h3>
                    <p>
                        This website is an ongoing project on mine that I'm using as a way to mess around and learn new things. It doesn't really
                        have any goals except for being a mechanism for me to mess with new technologies, put things that I've done, and (hopefully)
                        create useful tools.
                    </p>
                    <p>
                        We'll see how many of those things I get to.
                    </p>
                    <a href="index.html">Go back home</a>
                </div>
            </div>
        )
    }
}

function initAbout() {
    ReactDOM.render(
        <About />,
        document.getElementById('about-container'),
    );
}

module.exports = initAbout;
