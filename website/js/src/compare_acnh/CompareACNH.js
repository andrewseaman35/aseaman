import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import { getAPIUrl, KEY_CODE } from '../utils';

import VillagerCard from './VillagerCard';
import villagers from './acnh_villagers.js'


const NEW_RANDOM_ATTEMPTS = 5;


class CompareACNH extends React.Component {
    constructor() {
        super();
        this.completed = new Set();

        this.getRandomSelections = this.getRandomSelections.bind(this);
        this.nextComparison = this.nextComparison.bind(this);
        this.isNewComparison = this.isNewComparison.bind(this);
        this.toKey = this.toKey.bind(this);

        this.villagers = [...villagers];

        this.state = {
            villagerA: null,
            villagerARecord: null,
            villagerB: null,
            villagerBRecord: null,
        };
    }

    componentDidMount() {
        this.initEventListeners();
        this.nextComparison();
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
        const firstIndex = Math.floor(Math.random() * this.villagers.length);
        let secondIndex = null;
        while(secondIndex === null || secondIndex === firstIndex){
           secondIndex = Math.floor(Math.random() * this.villagers.length);
        }

        const villagerA = this.villagers[firstIndex];
        const villagerB = this.villagers[secondIndex];

        return {
            villagerA,
            villagerB,
        };
    }

    nextComparison() {
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

        this.setState({ villagerA, villagerB });
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
        const { villagerA, villagerB } = this.state;
        const loserId = winnerId === villagerA.id ? villagerB.id : villagerA.id;

        $('.compare-card').blur();
        const postData = {
            action: 'save',
            payload: {
                winner: winnerId,
                loser: loserId,
            },
        };
        $.ajax({
            type: 'POST',
            url: getAPIUrl('compare_acnh'),
            data: JSON.stringify(postData),
            contentType: 'application/json',
        }).then(() => {
            this.completed.add(this.toKey(villagerA, villagerB));
            this.nextComparison();
        });
    }

    renderCard(villager) {
        const {
            id,
            name,
            imageUrl,
            gender,
            personality,
            species,
            birthday,
            catchPhrase,
            hobbies,
        } = villager;
        return (
            <VillagerCard
                {...villager}
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
