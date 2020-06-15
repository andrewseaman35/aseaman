import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import Toggle from '../components/Toggle';

import villagers from './acnh_villagers'

import { fetchAllSummaries } from './api';
import { getAPIUrl, getUrlTo, KEY_CODE, setQueryStringParameter } from '../utils';


const LEADERBOARD_COUNT = 5;
const QS_VIEW = 'view';
const QS_SPECIES = 'species';
const VIEWS = {
    ALL: 'all',
    ALL_SPECIES: 'all_species',
    SPECIES: 'species',
}

function urlForVillager(villagerId) {
    return getUrlTo(`acnh/villager.html?villager_id=${villagerId}`)
}


class ACNHRankings extends React.Component {
    constructor() {
        super();
        this.villagersById = _.keyBy(villagers, 'id');

        this.allRankings = null;
        this.rankingsBySpecies = null;

        this.displayViewAll = this.displayViewAll.bind(this);
        this.displayBySpecies = this.displayBySpecies.bind(this);

        const view = this.getViewFromQueryString().toLowerCase();
        const selectedSpecies = view === VIEWS.ALL ? this.getSpeciesFromQueryString() : null;
        console.log(view)
        console.log(selectedSpecies)

        this.state = {
            loaded: false,
            selectedSpecies: selectedSpecies,
            view: view,
        };
    }

    componentDidMount() {
        fetchAllSummaries()
            .then((response) => {
                this.allRankings = response;
                this.rankingsBySpecies = {};
                _.each(this.allRankings, (ranking) => {
                    const villager = this.villagersById[ranking.villager_id];
                    if (!(villager.species in this.rankingsBySpecies)) {
                        this.rankingsBySpecies[villager.species] = [];
                    }
                    this.rankingsBySpecies[villager.species].push(ranking);
                });
                this.setState({ loaded: true });
            });
    }

    onRowClick(e) {
        const villagerId = e.currentTarget.dataset.villagerId;
        window.location = urlForVillager(villagerId);
    }

    getSpeciesFromQueryString() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(QS_SPECIES);

    }

    getViewFromQueryString() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(QS_VIEW) || VIEWS.ALL;
    }

    getSelectedRankings() {
        if (this.state.selectedSpecies in this.rankingsBySpecies) {
            return this.rankingsBySpecies[this.state.selectedSpecies].slice();
        }
        return this.allRankings.slice();
    }

    viewSpeciesRanking(species) {
        setQueryStringParameter(QS_VIEW, VIEWS.ALL);
        setQueryStringParameter(QS_SPECIES, species);
        this.setState({
            view: VIEWS.ALL,
            selectedSpecies: species,
        });
    }

    displayViewAll() {
        setQueryStringParameter(QS_VIEW, VIEWS.ALL);
        setQueryStringParameter(QS_SPECIES, null);
        this.setState({
            view: VIEWS.ALL,
            selectedSpecies: null,
        });
    }

    displayBySpecies() {
        setQueryStringParameter(QS_VIEW, VIEWS.SPECIES);
        setQueryStringParameter(QS_SPECIES, null);
        this.setState({
            view: VIEWS.SPECIES,
            selectedSpecies: null,
        });
    }

    renderHeaderText() {
        const { loaded, view, selectedSpecies } = this.state;
        if (this.state.loaded) {
            if (view === VIEWS.SPECIES) {
                return 'Species Leaderboard';
            }
            if (view === VIEWS.ALL && selectedSpecies in this.rankingsBySpecies) {
                return `Species Leaderboard: ${selectedSpecies}`;
            }

            return 'Villager Leaderboard';
        }
        return '';
    }

    renderBackButton() {
        const { selectedSpecies } = this.state;
        if (selectedSpecies === null) {
            return null;
        }
        return (
            <div className="back-to-all-species">
                <button
                    onClick={this.displayBySpecies}
                    className="link-button"
                >{"< Back to all species"}</button>
            </div>
        )
    }

    renderLeaders() {
        const rankings = this.getSelectedRankings();
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

    renderLeader(villager, record, position, omitBadge) {
        const badge = !omitBadge ? <div className={`place-badge place-${position}`}>{position}</div> :  null;
        return (
            <a key={position} href={urlForVillager(villager.id)}>
                <div className="leader">
                    {badge}
                    <img src={villager.imageUrl} />
                    <div className="leader-details">
                        <div className="name">{villager.name}</div>
                        <div className="record">{`(${record.wins} - ${record.losses})`}</div>
                        <div className="record">{`${record.win_percentage}%`}</div>
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
                <td>{`${item.win_percentage}%`}</td>
                <td className="hide-sm">{item.wins}</td>
                <td className="hide-sm">{item.losses}</td>
                <td className="sm-only">{`${item.wins}-${item.losses}`}</td>
                <td className="hide-sm">{item.total}</td>
            </tr>
        )
    }

    renderRankingsTable() {
        const rankings = this.getSelectedRankings().splice(LEADERBOARD_COUNT);
        return (
            <div className="rankings">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Place</th>
                            <th>Villager</th>
                            <th className="hide-sm">Win Percentage</th>
                            <th className="sm-only">Win %</th>
                            <th className="hide-sm">Wins</th>
                            <th className="hide-sm">Losses</th>
                            <th className="sm-only">Record</th>
                            <th className="hide-sm">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        { rankings.map((result, key) => (this.renderResultRow(key, result))) }
                    </tbody>
                </table>
            </div>
        )
    }

    renderViewBySpecies() {
        const sortedSpecies = _.sortBy(Object.keys(this.rankingsBySpecies));
        return (
            <div className="leaders by-species">
                {
                    _.map(sortedSpecies, (species) => {
                        const rankings = this.rankingsBySpecies[species];
                        return (
                            <div className="species-leader" key={species}>
                                <div onClick={() => { this.viewSpeciesRanking(species); }} className="species-label-container">
                                    <div className="species-label">{species}</div>
                                    <div className="view-species-label">Rankings > </div>
                                </div>

                                { this.renderLeader(this.villagersById[rankings[0].villager_id], rankings[0], 2, true) }
                            </div>
                        )
                    })
                }
            </div>
        )
    }


    render() {
        const { loaded, selectedSpecies, view } = this.state;
        const containerClass = (view === VIEWS.SPECIES) ? 'villager-species-container' : 'villager-rankings-container';
        let header = 'Villager Leaderboard';
        if (loaded && view ===  VIEWS.ALL && selectedSpecies in this.rankingsBySpecies) {
            header = `Species Leaderboard: ${selectedSpecies}`;
        } else if (view === VIEWS.SPECIES) {
            header = 'Species Leaderboard';
        }
        return (
            <React.Fragment>
                <div className="acnh-header">
                    <h1>{header}</h1>
                    <button className="view-leaderboard">
                        <a href={getUrlTo('acnh/compare.html')}>Vote now!</a>
                    </button>
                </div>
                <Toggle
                    startActive={view === VIEWS.SPECIES ? 'right' : 'left'}
                    leftLabel="View all"
                    rightLabel="View by species"
                    onLeftToggle={this.displayViewAll}
                    onRightToggle={this.displayBySpecies}
                />
                {
                    this.state.loaded && (
                        <div className={containerClass}>
                            {
                                view === VIEWS.SPECIES ? (
                                    this.renderViewBySpecies()
                                ) : (
                                    <React.Fragment>
                                        { this.renderBackButton() }
                                        { this.renderLeaders() }
                                        { this.renderRankingsTable() }
                                    </React.Fragment>
                                )
                            }
                        </div>
                    )
                }
            </React.Fragment>
        )
    }
}

module.exports = ACNHRankings;
