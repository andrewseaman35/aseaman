import React from 'react';
import $ from 'jquery';

import { getAPIUrl } from './utils';


class MameHighscore extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    componentDidMount() {
        this.retrieveHighscore().then(x => {
            console.log(x)
        });
    }

    retrieveHighscore() {
        // pacman, avspirit
        const postData = {
            action: 'metadata',
            payload: {
                game_id: 'avspirit',
            }
        };
        return $.ajax({
            type: 'POST',
            url: getAPIUrl('mame_highscore'),
            data: JSON.stringify(postData),
            contentType: 'application/json',
        }).promise();
    }

    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    Under development!
                </div>
            </div>
        )
    }
}


module.exports = MameHighscore;
