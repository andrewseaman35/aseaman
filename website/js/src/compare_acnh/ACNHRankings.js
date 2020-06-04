import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import villagers from './acnh_villagers'

import { fetchAllSummaries } from './api';
import { getAPIUrl, getUrlTo, KEY_CODE } from '../utils';


const LEADERBOARD_COUNT = 5;

function urlForVillager(villagerId) {
    return getUrlTo(`acnh/villager.html?villager_id=${villagerId}`)
}


class ACNHRankings extends React.Component {
    constructor() {
        super();
        this.villagersById = _.keyBy(villagers, 'id');

        this.state = {
            rankings: null,
        };
    }

    componentDidMount() {
        fetchAllSummaries()
            .then((response) => {
                this.setState({
                    rankings: response,
                });
            });
    }

    onRowClick(e) {
        const villagerId = e.currentTarget.dataset.villagerId;
        window.location = urlForVillager(villagerId);
    }

    renderLeaders() {
        const { rankings } = this.state;
        if (!rankings) {
            return null;
        }

        const leaders = _.map(rankings.splice(0, LEADERBOARD_COUNT), (record) => ({
            villager: this.villagersById[record.villager_id],
            record,
        }));

        return (
            <div className="leaders">
                <div className="first-place">
                    { this.renderLeader(leaders[0].villager, leaders[0].record, 1) }
                </div>
                <div className="runners-up">
                    {
                        _.map(leaders.splice(1), (leader, place) => this.renderLeader(leader.villager, leader.record, place + 2))
                    }
                </div>
            </div>
        )
    }

    renderLeader(villager, record, position) {
        const recordString = `(${record.wins} - ${record.losses})`;
        return (
            <a key={position} href={urlForVillager(villager.id)}>
                <div className="leader">
                    <div className={`place-badge place-${position}`}>{position}</div>
                    <img src={villager.imageUrl} />
                    <div className="leader-details">
                        <div className="name">{villager.name}</div>
                        <div className="record">{recordString}</div>
                    </div>
                </div>
            </a>
        )
    }

    renderResultRow(key, item) {
        return (
            <tr key={key} data-villager-id={item.villager_id} onClick={this.onRowClick}>
                <td>({key + LEADERBOARD_COUNT + 1})</td>
                <td>{this.villagersById[item.villager_id].name}</td>
                <td>{item.wins}</td>
                <td>{item.losses}</td>
            </tr>
        )
    }

    renderRankingsTable() {
        const { rankings } = this.state;
        if (!rankings) {
            return null;
        }
        return (
            <div className="rankings">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Place</th>
                            <th>Villager</th>
                            <th>Wins</th>
                            <th>Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        { rankings.map((result, key) => (this.renderResultRow(key, result))) }
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        return (
            <React.Fragment>
                <h1>
                    Villager Showdown Leaderboard
                </h1>
                <div className="view-leaderboard">
                    <a href={getUrlTo('acnh/compare.html')}>Vote now!</a>
                </div>
                <div className='villager-rankings-container'>
                    { this.renderLeaders() }
                    { this.renderRankingsTable() }
                </div>
            </React.Fragment>
        )
    }
}

module.exports = ACNHRankings;
