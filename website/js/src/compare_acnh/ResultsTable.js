import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

import Icon from '../components/icon/Icon';
import { getUrlTo } from '../utils';

import villagers from './acnh_villagers';
import { SORT_KEYS } from './constants';


function urlForVillager(villagerId) {
    return getUrlTo(`acnh/villager?villager_id=${villagerId}`)
}


class ResultsTable extends React.Component {
    constructor() {
        super();
        this.villagersById = _.keyBy(villagers, 'id');

        this.idToName = this.idToName.bind(this);
        this.getSortedItems = this.getSortedItems.bind(this);
        this.getItemsToDisplay = this.getItemsToDisplay.bind(this);

        this.state = {
            sort: {
                key: SORT_KEYS.WINS,
                descending: true,
            },

            pageIndex: 0,
            pageSize: 30,
        };
    }

    onRowClick(e) {
        const villagerId = e.currentTarget.dataset.villagerId;
        window.location = urlForVillager(villagerId);
    }

    idToName(id) {
        return this.villagersById[id].name;
    }

    getSortedItems() {
        const { sort } = this.state;

        let sortFunc;
        let reverseMultiplier = 1;
        if (sort.key === 'wins') {
            if (sort.descending) {
                sortFunc = (item) => (
                    [(item.wins * -1), (item.losses * -1), this.idToName(item.v_id2)]
                );
            } else {
                sortFunc = (item) => (
                    [(item.wins), (item.losses * -1), this.idToName(item.v_id2)]
                );
            }
        } else if (sort.key === 'losses') {
            if (sort.descending) {
                sortFunc = (item) => (
                    [(item.losses * -1), (item.wins * -1), this.idToName(item.v_id2)]
                );
            } else {
                sortFunc = (item) => (
                    [(item.losses), (item.wins * -1), this.idToName(item.v_id2)]
                );
            }
        } else {
            sortFunc = (item) => this.idToName(item.v_id2);
            if (sort.descending) {
                reverseMultiplier = -1;
            }
        }

        return this.props.results.slice().sort((a, b) => (
            sortFunc(a) < sortFunc(b) ? -1 : 1
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
                descending: sameHeaderClicked ? !sort.descending : false,
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
        const sortIconName = sort.descending ? 'caretDown' : 'caretUp';
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
                        { sort.key === SORT_KEYS.LOSSES && <Icon icon={sortIconName} size={16} /> }
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
                        <tr onClick={this.onRowClick} data-villager-id={result.v_id2} key={key}>
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
                        pageIndex !== (pageCount - 1) && (pageCount > 1) && (
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
