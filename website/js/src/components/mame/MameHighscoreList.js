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
                            <th>Parsed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.gameList.games.map(game => (
                                <tr
                                    key={game.gameId}
                                    onClick={
                                        () => { this.props.onGameClick(game.gameId) }
                                    }
                                >
                                    <td>{game.gameName}</td>
                                    <td>{toReadableDateTime(game.lastModified)}</td>
                                    <td>{`${game.hasParser ? 'Y' : ''}`}</td>
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
    gameList: PropTypes.shape({
        games: PropTypes.arrayOf(
            PropTypes.shape({
                gameName: PropTypes.string,
                gameId: PropTypes.string,
                lastModified: PropTypes.number,
            })
        ),
        parsers: PropTypes.arrayOf(
            PropTypes.string,
        ),
    }),
    onGameClick: PropTypes.func.isRequired,
};


module.exports = MameHighscoreList;
