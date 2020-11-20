import React from 'react';
import PropTypes from 'prop-types';


class MameHighscoreList extends React.Component {
    render() {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Game</th>
                        <th>Last updated</th>
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
                                <td>{game.lastModified}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
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
