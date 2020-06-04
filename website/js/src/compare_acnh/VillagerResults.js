import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import { getAPIUrl, KEY_CODE } from '../utils';

import { fetchVillagerResults, fetchVillagerSummaries } from './api';
import villagers from './acnh_villagers.js'
import VillagerCard from './VillagerCard';


const NEW_RANDOM_ATTEMPTS = 5;


class VillagerResults extends React.Component {
    constructor() {
        super();
        this.villagersById = _.keyBy(villagers, 'id');

        this.fetchData = this.fetchData.bind(this);

        this.state = {
            villagerId: null,
            summary: null,
            results: null,
        };
    }

    componentDidMount() {
        this.getVillagerIdAndInit();
    }

    fetchData() {
        const { villagerId } = this.state;

        $.when(fetchVillagerResults(villagerId), fetchVillagerSummaries([villagerId]))
            .done((resultsResponse, summariesResponse) => {
                const results = resultsResponse[0];
                const summary = summariesResponse[0][0];
                this.setState({ results, summary });
            });
    }

    getVillagerIdAndInit() {
        const urlParams = new URLSearchParams(window.location.search);
        const villagerId = urlParams.get('villager_id');
        this.setState({ villagerId }, this.fetchData);
    }

    renderResultRow(key, result) {
        return (
            <tr key={key}>
                <td>{this.villagersById[result.v_id2].name}</td>
                <td>{result.wins}</td>
                <td>{result.losses}</td>
            </tr>
        )
    }

    renderResultsTable(villager) {
        const { results } = this.state;
        if (!results) {
            return null;
        }
        return (
            <div className="results">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Opponent</th>
                            <th>Wins</th>
                            <th>Losses</th>
                        </tr>
                    </thead>
                    <tbody>
                        { results.map((result, key) => (this.renderResultRow(key, result))) }
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        const { villagerId, summary } = this.state;
        if (!villagerId) {
            return null;
        }
        const villager = this.villagersById[villagerId];

        return (
            <div className='villager-results-container'>
                <VillagerCard
                    {...villager}
                    summary={summary}
                >
                </VillagerCard>
                { this.renderResultsTable(villager) }
            </div>
        )
    }
}

module.exports = VillagerResults;
