import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
    getScoresByGameId,
} from './api';


const MameHighscoreTable = (props) => {
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.gameId) {
            setLoading(true);
            getScoresByGameId(props.gameId)
                .then((scores) => {
                    setScores(scores);
                    setLoading(false);
                }
            );
        }
    }, [props.gameId])

    if (loading) {
        return <div className="highscore-table no-scores">loading scores...</div>
    } else if (!scores) {
        return <div className="highscore-table no-scores">&lt;--- Select a game!</div>
    }
    if (scores.error) {
        return <div className="highscore-table no-scores">Score parser not available</div>
    }
    return (
        <div className="highscore-table">
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        scores.map((score, index) => (
                            <tr key={index}>
                                <td>{score.user}</td>
                                <td>{score.score}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}



MameHighscoreTable.propTypes = {
    gameId: PropTypes.string,
};


module.exports = MameHighscoreTable;
