import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import { KEY_CODE } from '../utils';

import { fetchAllSummaries, submitResult } from './api';
import VillagerCard from './VillagerCard';
import villagers from './acnh_villagers.js'


const NEW_RANDOM_ATTEMPTS = 5;


class CompareACNH extends React.Component {
    constructor() {
        super();
        this.completed = new Set();

        this.getRandomSelections = this.getRandomSelections.bind(this);
        this.refreshVillagerOrder = this.refreshVillagerOrder.bind(this);
        this.nextComparison = this.nextComparison.bind(this);
        this.isNewComparison = this.isNewComparison.bind(this);
        this.toKey = this.toKey.bind(this);

        this.villagers = [...villagers];
        this.villagersById = _.keyBy(this.villagers, 'id');

        this.villagerSummaries = null;
        this.orderedVillagerIds = null;
        this.orderIndex = 0;

        this.state = {
            villagerA: null,
            villagerARecord: null,
            villagerB: null,
            villagerBRecord: null,

            winnerId: null,
            loading: false,
        };
    }

    componentDidMount() {
        this.refreshVillagerOrder(() => {
            this.initEventListeners();
            this.nextComparison();
        });
    }

    refreshVillagerOrder(callback) {
        fetchAllSummaries().then((response) => {
            this.orderIndex = 0;
            this.villagerSummaries = response;
            this.orderedVillagerIds = this.orderedVillagerIdsByMatchCount(this.villagerSummaries);
            callback();
        });
    }

    orderedVillagerIdsByMatchCount(summaries) {
        const villagerIdByMatchCount = {};
        _.each(summaries, (summary) => {
            const count = Number(summary.wins) + Number(summary.losses);
            if (!(count in villagerIdByMatchCount)) {
                villagerIdByMatchCount[count] = [];
            }
            villagerIdByMatchCount[count].push(summary.villager_id);
        });
        console.log(villagerIdByMatchCount)

        const orderedVillagerIds = [];
        _.each(_.sortBy(Object.keys(villagerIdByMatchCount), (k) => Number(k)), count => {
            orderedVillagerIds.push(..._.shuffle(villagerIdByMatchCount[count]));
        });

        return orderedVillagerIds;
    }

    initEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.code === KEY_CODE.LEFT) {
                this.submitSelection(this.state.villagerA.id);
            } else if (event.code === KEY_CODE.RIGHT) {
                this.submitSelection(this.state.villagerB.id)
            }
        });
    }

    getRandomSelections() {
        const villagerAId = this.orderedVillagerIds[this.orderIndex++];
        const villagerA = this.villagersById[villagerAId];

        let secondIndex = null;
        while(secondIndex === null || this.villagers[secondIndex].id === villagerAId){
           secondIndex = Math.floor(Math.random() * this.villagers.length);
        }

        const villagerB = this.villagers[secondIndex];

        return {
            villagerA,
            villagerB,
        };
    }

    nextComparison() {
        if (this.orderIndex >= this.orderedVillagerIds.length) {
            return this.refreshVillagerOrder(() => {
                this.nextComparison();
            });
        }
        let villagersSelected = false;
        let villagerA = null;
        let villagerB = null;
        for (let i = 0; i < NEW_RANDOM_ATTEMPTS; i += 1) {
            const villagers = this.getRandomSelections();
            villagerA = villagers.villagerA;
            villagerB = villagers.villagerB;
            if (this.isNewComparison(villagerA, villagerB)) {
                break;
            }
        }

        this.setState({ villagerA, villagerB, loading: false, winnerId: null });
    }

    isNewComparison(villagerA, villagerB) {
        const key = this.toKey(villagerA, villagerB);
        return !this.completed.has(key);
    }

    toKey(villagerA, villagerB) {
        const sortedIds = [villagerA.id, villagerB.id].sort();
        return sortedIds.join('|');
    }

    submitSelection(winnerId) {
        if (this.state.loading) {
            return;
        }
        const { villagerA, villagerB } = this.state;
        const loserId = winnerId === villagerA.id ? villagerB.id : villagerA.id;
        this.setState({ loading: true, winnerId: winnerId });

        $('.compare-card').blur();
        submitResult(winnerId, loserId).then(() => {
            this.completed.add(this.toKey(villagerA, villagerB));
            this.nextComparison();
        });
    }

    renderCard(villager) {
        let cardClass = 'villager-compare';
        if (this.state.winnerId !== null) {
            cardClass += this.state.winnerId === villager.id ? ' winner' : ' loser';
        }
        return (
            <VillagerCard
                {...villager}
                class={cardClass}
                forCompare
                onClick={() => { this.submitSelection(villager.id) }}
            >
            </VillagerCard>
        )
    }

    render() {
        const { villagerA, villagerB } = this.state;
        if (!villagerA || !villagerB) {
            return null;
        }

        return (
            <div>
                <div className='compare-container'>
                    {this.renderCard(villagerA)}
                    {this.renderCard(villagerB)}
                </div>
            </div>
        )
    }
}

module.exports = CompareACNH;
