import React from 'react';
import $ from 'jquery';

import MameHighscoreList from './components/mame/MameHighscoreList';

import {
    getMetadata,
    getScoresByGameId,
} from './components/mame/api';


class MameHighscore extends React.Component {
    constructor() {
        super();

        this.state = {
            loadingMetadata: true,
            metadata: null,
        };
    }

    componentDidMount() {
        getMetadata()
            .then(metadata => {
                this.setState({
                    metadata,
                    loadingMetadata: false,
                });
            });
        getScoresByGameId('avspirit').then(metadata => {
        });
    }

    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    Under development!
                    {
                        !this.state.loadingMetadata && (
                            <MameHighscoreList
                                gameList={this.state.metadata}
                            />
                        )
                    }
                </div>
            </div>
        )
    }
}


module.exports = MameHighscore;
