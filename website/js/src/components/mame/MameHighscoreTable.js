import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
    getScoresByGameId,
} from './api';


const scoreDataStore = {};


const MameHighscoreTable = (props) => {
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (props.gameId) {
            setLoading(true);
            if (scoreDataStore[props.gameId]) {
                setScores(scoreDataStore[props.gameId]);
                setLoading(false);
            } else {
                getScoresByGameId(props.gameId)
                    .then((scores) => {
                        if (scores.errorMessage) {
                            setErrorMessage(scores.errorMessage);
                            setScores(null);
                        } else {
                            scoreDataStore[props.gameId] = scores
                            setErrorMessage(null);
                            setScores(scores);
                        }
                    }, (error) => {
                        console.log(error)
                        setErrorMessage(error.responseJSON.message);
                    })
                    .then(() => {
                        setLoading(false);
                    });
            }
        }
    }, [props.gameId])

    if (loading) {
        return (
            <div className="highscore-table no-scores animated-ellipsis">
                Loading scores<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
            </div>
        )
    } else if (errorMessage) {
        return <div className="highscore-table no-scores">{errorMessage}</div>
    } else if (!scores) {
        return <div className="highscore-table no-scores">&lt;--- Select a game!</div>
    }

    return (
        <div className="highscore-table">
            <div className="table-header">{props.game.gameTitle}</div>
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
    game: PropTypes.shape({
        title: PropTypes.string,
    }),
};


module.exports = MameHighscoreTable;
