import React from 'react';
import $ from 'jquery';
import _ from 'lodash';

import MameHighscoreList from './components/mame/MameHighscoreList';
import MameHighscoreTable from './components/mame/MameHighscoreTable';

import {
    getMetadata,
    getScoresByGameId,
} from './components/mame/api';


class MameHighscore extends React.Component {
    constructor() {
        super();

        this.onGameClick = this.onGameClick.bind(this);

        this.gamesById = null;
        this.state = {
            loadingMetadata: true,
            selectedGameId: null,
        };
    }

    componentDidMount() {
        getMetadata()
            .then(metadata => {
                this.gamesById = _.keyBy(metadata.games, 'gameId');
                console.log(this)
                this.setState({
                    loadingMetadata: false,
                });
            });
    }

    get gameMetadataList() {
        return Object.values(this.gamesById);
    }

    onGameClick(gameId) {
        this.setState({ selectedGameId: gameId });
    }

    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    <div className="mame-container">
                        {
                            !this.state.loadingMetadata && (
                                <React.Fragment>
                                    <MameHighscoreList
                                        games={this.gameMetadataList}
                                        selectedGameId={this.state.selectedGameId}
                                        onGameClick={this.onGameClick}
                                    />
                                    <MameHighscoreTable
                                        gameId={this.state.selectedGameId}
                                        game={this.gamesById[this.state.selectedGameId]}
                                    />
                                </React.Fragment>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }
}


module.exports = MameHighscore;
