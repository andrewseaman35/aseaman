import React from 'react';
import _ from 'lodash';

import MameHighscoreList from './components/mame/MameHighscoreList';
import MameHighscoreTable from './components/mame/MameHighscoreTable';

import {
    getMetadata,
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
                    {
                        this.state.loadingMetadata && (
                            <div className="loading-container">
                                <div className="animated-ellipsis">
                                    Loading<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}


module.exports = MameHighscore;
