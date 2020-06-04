import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import $ from 'jquery';

import Icon from '../components/icon/Icon';

import villagers from './acnh_villagers';
import { SORT_KEYS } from './constants';


class ResultsTable extends React.Component {
    constructor() {
        super();
        this.villagersById = _.keyBy(villagers, 'id');

        this.idToName = this.idToName.bind(this);
        this.getSortedItems = this.getSortedItems.bind(this);
        this.getItemsToDisplay = this.getItemsToDisplay.bind(this);

        this.state = {
            villagerId: null,
            summary: null,
            results: null,

            sort: {
                key: SORT_KEYS.NAME,
                reversed: false,
            },

            pageIndex: 0,
            pageSize: 30,
        };
    }

    idToName(id) {
        return this.villagersById[id].name;
    }

    getSortedItems() {
        const { sort } = this.state;

        let sortFunc;
        if (sort.key === 'wins') {
            sortFunc = (item) => (
                [item.wins, (item.losses * -1), this.idToName(item.v_id2)]
            );
        } else if (sort.key === 'losses') {
            sortFunc = (item) => (
                [item.losses, (item.wins * -1), this.idToName(item.v_id2)]
            );
        } else {
            sortFunc = (item) => this.idToName(item.v_id2);
        }

        const reverseMultiplier = sort.reversed ? -1 : 1;
        return this.props.results.concat().sort((a, b) => (
            sortFunc(a) < sortFunc(b) ? (-1 * reverseMultiplier) : (1 * reverseMultiplier)
        ))
    }

    getItemsToDisplay() {
        const { pageIndex, pageSize } = this.state;
        const sortedResults = this.getSortedItems();

        const startIndex = pageIndex * pageSize;
        return sortedResults.splice(startIndex, pageSize);
    }

    setSort(newSortKey) {
        const { sort } = this.state;
        const sameHeaderClicked = newSortKey === sort.key;
        this.setState({
            sort: {
                key: newSortKey,
                reversed: sameHeaderClicked ? !sort.reversed : false,
            }
        });
    }

    setPage(newPage) {
        this.setState({
            pageIndex: newPage,
        });
    }

    renderTableHeader() {
        const { sort } = this.state;
        const sortIconName = this.state.sort.reversed ? 'caretDown' : 'caretUp';
        return (
            <thead>
                <tr>
                    <th onClick={() => {this.setSort(SORT_KEYS.NAME)}}>
                        <span>Opponent</span>
                        { sort.key === SORT_KEYS.NAME && <Icon icon={sortIconName} size={16} /> }
                    </th>
                    <th onClick={() => {this.setSort(SORT_KEYS.WINS)}}>
                        <span>Wins</span>
                        { sort.key === SORT_KEYS.WINS && <Icon icon={sortIconName} size={16} /> }
                    </th>
                    <th onClick={() => {this.setSort(SORT_KEYS.LOSSES)}}>
                        <span>Losses</span>
                        { sort.key === SORT_KEYS.Losses && <Icon icon={sortIconName} size={16} /> }
                    </th>
                </tr>
            </thead>
        )
    }

    renderTableBody() {
        const results = this.getItemsToDisplay();
        return (
            <tbody>
                {
                    results.map((result, key) => (
                        <tr key={key}>
                            <td>{this.villagersById[result.v_id2].name}</td>
                            <td>{result.wins}</td>
                            <td>{result.losses}</td>
                        </tr>
                    ))
                }
            </tbody>
        )
    }

    renderTable() {
        const { results } = this.props;
        return (
            <table className="results-table">
                { this.renderTableHeader() }
                { this.renderTableBody() }
            </table>
        )
    }

    renderPagination() {
        const { pageIndex } = this.state;
        const pageCount = Math.floor(this.props.results.length / this.state.pageSize);
        const pageButtons = _.map(_.range(1, pageCount + 1), n => n.toString());

        return (
            <div className="pagination">
                <div className="button-container">
                    {
                        pageIndex !== 0 && (
                            <button onClick={() => { this.setPage(pageIndex - 1) }}>{'<prev'}</button>
                        )
                    }
                    {
                        _.map(pageButtons, (val, key) => (
                            <button
                                onClick={() => { this.setPage(key) }}
                                key={key}
                                disabled={key === pageIndex}>{val}
                            </button>
                        ))
                    }
                    {
                        pageIndex !== (pageCount - 1) && (
                            <button onClick={() => { this.setPage(pageIndex + 1) }}>{'next>'}</button>
                        )
                    }
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="results">
                <div className="table-container">
                    { this.renderTable() }
                </div>
                { this.renderPagination() }
            </div>
        )
    }
}

ResultsTable.defaultProps = {

};

ResultsTable.propTypes = {
    results: PropTypes.arrayOf(
        PropTypes.shape({
            v_id: PropTypes.string.isRequired,
            v_id2: PropTypes.string.isRequired,
            losses: PropTypes.number.isRequired,
            wins: PropTypes.number.isRequired,
        }),
    ).isRequired,
};

module.exports = ResultsTable;
