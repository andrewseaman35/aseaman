import React from 'react';
import _ from 'lodash';
import $ from 'jquery';

import { getImageSrc } from '../utils';
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
            villagerB: null,
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

    submitSelection(villagerId) {
        const { villagerA, villagerB } = this.state;
        const selectedVillager = villagerId = villagerA.id ? villagerA : villagerB;
        console.log(`selected ${selectedVillager.name}`);
        $('.compare-card').blur();
        this.completed.add(this.toKey(villagerA, villagerB));
        this.nextComparison();
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
            <button className="compare-card" onClick={() => { this.submitSelection(villager.id) }}>
                <div className="compare-inner">
                    <img src={imageUrl}></img>
                    <div className="detail-container">
                        <div className="name">{name}</div>
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
        const { villagerA, villagerB } = this.state;
        if (!villagerA || ! villagerB) {
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
