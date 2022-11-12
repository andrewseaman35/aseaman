import React from 'react';
import PropTypes from 'prop-types';

import { toReadableDateTime } from '../../utils';


class MameHighscoreList extends React.Component {
    render() {
        return (
            <div className="highscore-list">
                <table>
                    <thead>
                        <tr>
                            <th>Game</th>
                            <th>Last updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.games.map(game => (
                                <tr
                                    key={game.gameId}
                                    className={`${game.hasParser ? 'parsed' : ''} ${game.gameId === this.props.selectedGameId ? 'selected': ''}`}
                                    onClick={
                                        () => { this.props.onGameClick(game.gameId) }
                                    }
                                >
                                    <td>{game.gameName}</td>
                                    <td>{toReadableDateTime(game.lastModified)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}


MameHighscoreList.propTypes = {
    selectedGameId: PropTypes.string,
    games: PropTypes.arrayOf(
        PropTypes.shape({
            gameName: PropTypes.string,
            gameId: PropTypes.string,
            lastModified: PropTypes.number,
        })
    ),
    onGameClick: PropTypes.func.isRequired,
};


module.exports = MameHighscoreList;
