import React from 'react';
import ReactDOM from 'react-dom';

const TRAVIS_URL_BASE = "https://travis-ci.org/andrewseaman35/aseaman.svg";


class Footer extends React.Component {
    getTravisIconUrl(branch) {
        return `${TRAVIS_URL_BASE}?branch=${branch}&cache_buster=${Date.now()}`
    }

    renderTravisItem(branch) {
        const title = branch[0].toUpperCase() + branch.substring(1);
        return (
            <div className="travis-item">
                <div>{title}: </div>
                <img
                    src={this.getTravisIconUrl(branch)}
                    id={`travis-status-${branch}`}
                    alt={`Travis ${branch} Status`}
                />
            </div>
        )
    }

    renderSocialItem(link, img, alt) {
        return (
            <a href={link} target="_blank" rel="noopener noreferrer">
                <img className="social-icon" src={img} alt={alt} />
            </a>
        )
    }

    render() {
        return (
            <div className="container">
                <div className="travis-container">
                    {this.renderTravisItem('develop')}
                    {this.renderTravisItem('master')}
                </div>
                <div className="social-container">
                    {
                        this.renderSocialItem(
                            "https://www.linkedin.com/in/andrewseaman/",
                            "/img/linkedin_logo_black_48px.png",
                            "LinkedIn",
                        )
                    }
                    {
                        this.renderSocialItem(
                            "https://github.com/andrewseaman35/",
                            "/img/github_logo_64px.png",
                            "GitHub",
                        )
                    }
                </div>
            </div>
        )
    }
}

function initFooter(containerId) {
    ReactDOM.render(
        <Footer />,
        document.getElementById(containerId),
    );
}

module.exports = { initFooter };
