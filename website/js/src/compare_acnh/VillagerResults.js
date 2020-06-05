import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import ResultsTable from './ResultsTable';
import VillagerCard from './VillagerCard';

import villagers from './acnh_villagers'
import { fetchVillagerResults, fetchAllSummaries } from './api';

import { getAPIUrl, getUrlTo, KEY_CODE } from '../utils';



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

        $.when(fetchVillagerResults(villagerId), fetchAllSummaries())
            .done((resultsResponse, summariesResponse) => {
                const results = _.filter(resultsResponse[0], (result) => (result.wins + result.losses > 0));
                const summaryIndex = _.findIndex(summariesResponse[0], { 'villager_id': villagerId} );
                const overallRanking = summaryIndex + 1;
                const summary = summariesResponse[0][summaryIndex];
                const speciesRanking = _.filter(
                    summariesResponse[0].splice(0, summaryIndex + 1),
                    (summary) => (
                        this.villagersById[summary.villager_id].species === this.villagersById[villagerId].species
                    )
                ).length
                this.setState({ results, summary, speciesRanking, overallRanking });
            });
    }

    getVillagerIdAndInit() {
        const urlParams = new URLSearchParams(window.location.search);
        const villagerId = urlParams.get('villager_id');
        this.setState({ villagerId }, this.fetchData);
    }

    render() {
        const { villagerId, results, summary } = this.state;
        if (!villagerId) {
            return null;
        }
        const villager = this.villagersById[villagerId];

        return (
            <React.Fragment>
                <div className="acnh-header">
                    <h1>Villager Stats: {villager.name}</h1>
                    <button className="view-leaderboard">
                        <a href={getUrlTo('acnh/compare.html')}>Vote now!</a>
                    </button>
                </div>
                <div className="view-leaderboard">
                    <button
                        className="link-button"
                        onClick={ () => { window.history.back(); } }
                    >{"< Back"}</button>
                </div>
                <div className='villager-results-container'>
                    <VillagerCard
                        {...villager}
                        summary={summary}
                        class="villager-stats"
                        speciesRanking={this.state.speciesRanking}
                        overallRanking={this.state.overallRanking}
                    >
                    </VillagerCard>
                    {
                        results && (
                            <ResultsTable
                                results={results}
                            >
                            </ResultsTable>
                        )
                    }
                </div>
            </React.Fragment>
        )
    }
}

module.exports = VillagerResults;
