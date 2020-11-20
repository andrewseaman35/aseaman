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

        this.onGameClick = this.onGameClick.bind(this);

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
    }

    onGameClick(gameId) {
        getScoresByGameId(gameId).then(scores => {
            console.log(scores);
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
                                onGameClick={this.onGameClick}
                            />
                        )
                    }
                </div>
            </div>
        )
    }
}


module.exports = MameHighscore;
