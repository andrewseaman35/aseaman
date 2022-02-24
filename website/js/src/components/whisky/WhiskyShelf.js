import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import AUTH from '../../auth';

import WhiskyRow from './WhiskyRow';
import Icon from '../icon/Icon';

import {
    SORT,
    TABLE_COLUMN_ORDER,
    TABLE_COLUMN_HEADER_LABELS,
} from './constants';


class WhiskyShelf extends React.Component {
    constructor() {
        super();

        this.getSortedItems = this.getSortedItems.bind(this);
        this.onHeaderItemClick = this.onHeaderItemClick.bind(this);
        this.renderTableBody = this.renderTableBody.bind(this);
        this.renderTableHeader = this.renderTableHeader.bind(this);

        this.state = {
            sort: {
                key: 'distillery',
                reversed: false,
            }
        }
    }

    getSortedItems() {
        const { sort } = this.state;
        const order = SORT[sort.key];
        const sortKey = (item) => (
            order.map(key => item[key] && item[key].toLowerCase && item[key].toLowerCase())
        )
        const reverseMultiplier = sort.reversed ? -1 : 1;
        return this.props.items.concat().sort((a, b) => (
            sortKey(a) < sortKey(b) ? (-1 * reverseMultiplier) : (1 * reverseMultiplier)
        ));
    }

    onHeaderItemClick(event) {
        const { sort } = this.state;
        const newSortKey = event.currentTarget.dataset.sortKey;
        if (newSortKey in SORT) {
            const sameHeaderClicked = newSortKey === sort.key;
            this.setState({
                sort: {
                    key: newSortKey,
                    reversed: sameHeaderClicked ? !sort.reversed : false,
                }
            })
        }
    }

    renderLoading() {
        return (
            <div>Loading...</div>
        )
    }

    renderError() {
        return (
            <div className='error-message'>Something happened while retrieving the shelf!</div>
        )
    }

    renderActionHeaderItem() {
        if (!AUTH.isLoggedIn()) {
            return null;
        }
        return (
            <th className="actions" key={Object.keys(TABLE_COLUMN_ORDER).length}></th>
        )
    }

    renderTableHeader() {
        return (
            <thead>
                <tr>
                    {
                        TABLE_COLUMN_ORDER.map((item, index) => {
                            const isSorted = this.state.sort.key === item;
                            const icon = this.state.sort.reversed ? 'caretDown' : 'caretUp';
                            return (
                                <th onClick={this.onHeaderItemClick} key={index} data-sort-key={item}>
                                    {TABLE_COLUMN_HEADER_LABELS[item]}
                                    {
                                        isSorted && (
                                            <Icon
                                                icon={icon}
                                                size={16}
                                            />
                                        )
                                    }
                                </th>
                            );
                        })
                    }
                    { this.renderActionHeaderItem() }
                </tr>
            </thead>
        )
    }

    renderTableBody() {
        const { loading, items } = this.props;
        const sortedItems = this.getSortedItems();
        return (
            <tbody>
                {
                    sortedItems.map((item, index) => (
                        <WhiskyRow
                            onWhiskyRemoved={this.props.onWhiskyRemoved}
                            onStartEditWhisky={this.props.onStartEditWhisky}
                            item={item}
                            key={index}
                        />
                    ))
                }
            </tbody>
        )
    }

    renderTable() {
        return (
            <table id="whisky-shelf-table">
                { this.renderTableHeader() }
                { this.renderTableBody() }
            </table>
        )
    }

    render() {
        if (this.props.loading) {
            return this.renderLoading();
        }
        if (this.props.failed) {
            return this.renderError();
        }

        return (
            <div className="whisky-shelf">
                { this.renderTable() }
            </div>
        )
    }
}

WhiskyShelf.propTypes = {
    onWhiskyRemoved: PropTypes.func.isRequired,
    onStartEditWhisky: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    failed: PropTypes.bool.isRequired,
    items: PropTypes.array,
}


module.exports = WhiskyShelf;
