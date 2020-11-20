import React from 'react';
import $ from 'jquery';

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

        this.state = {
            loadingMetadata: true,
            metadata: null,

            selectedGameId: null,
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
        this.setState({ selectedGameId: gameId });
    }

    render() {
        return (
            <div className="inner">
                <div className="left-content">
                    <div className="dev">Under development!</div>
                    <div className="mame-container">
                        {
                            !this.state.loadingMetadata && (
                                <React.Fragment>
                                    <MameHighscoreList
                                        gameList={this.state.metadata}
                                        onGameClick={this.onGameClick}
                                    />
                                    <MameHighscoreTable
                                        gameId={this.state.selectedGameId}
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
