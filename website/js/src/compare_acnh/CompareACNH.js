import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import { getAPIUrl } from '../utils';
import villagers from './acnh_villagers.js'


const NEW_RANDOM_ATTEMPTS = 5;


class CompareACNH extends React.Component {
    constructor() {
        super();
        this.completed = new Set();

        this.fetchVillagerSummaries = this.fetchVillagerSummaries.bind(this);

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
        this.nextComparison();
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

    fetchVillagerSummaries(villagerIds) {
        const postData = {
            action: 'get_summary_items',
            payload: {
                villager_ids: villagerIds,
            },
        };
        return $.ajax({
            type: 'POST',
            url: getAPIUrl('compare_acnh'),
            data: JSON.stringify(postData),
            contentType: 'application/json',
        }).promise();
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

        this.fetchVillagerSummaries([villagerA.id, villagerB.id])
            .then((response) => {
                const recordByVillagerId = _.keyBy(response, 'villager_id');
                console.log(response)
                console.log(recordByVillagerId)
                this.setState({
                    villagerA,
                    villagerB,
                    villagerARecord: recordByVillagerId[villagerA.id],
                    villagerBRecord: recordByVillagerId[villagerB.id],
                });
            });
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

    renderCard(villager, record) {
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
            <button className="compare-card" onClick={() => { this.submitSelection(villager.id) }}>
                <div className="compare-inner">
                    <img src={imageUrl}></img>
                    <div className="detail-container">
                        <div className="name-and-record">
                            {name} <span className="record">({record.wins} - {record.losses})</span>
                        </div>
                        <table className="detail-table">
                            <tbody>
                                <tr>
                                    <td className="detail-label">Gender: </td>
                                    <td className="detail-value">{gender}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">Personality: </td>
                                    <td className="detail-value">{personality}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">Species: </td>
                                    <td className="detail-value">{species}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">Birthday: </td>
                                    <td className="detail-value">{birthday}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">Catch Phrase: </td>
                                    <td className="detail-value">{catchPhrase}</td>
                                </tr>
                                <tr>
                                    <td className="detail-label">Hobbies: </td>
                                    <td className="detail-value">{hobbies}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </button>
        )
    }

    render() {
        const { villagerA, villagerB, villagerARecord, villagerBRecord } = this.state;
        if (!villagerA || !villagerB) {
            return null;
        }

        return (
            <div>
                <div className='compare-container'>
                    {this.renderCard(villagerA, villagerARecord)}
                    {this.renderCard(villagerB, villagerBRecord)}
                </div>
            </div>
        )
    }
}

module.exports = CompareACNH;
