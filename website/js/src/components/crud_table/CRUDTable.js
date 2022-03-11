import React from 'react';
import PropTypes from 'prop-types';

import { AnimatedEllipsis } from '../index';

import CRUDTableHeader from './CRUDTableHeader';
import CRUDTableRow from './CRUDTableRow';


class CRUDTable extends React.Component {
    constructor(props) {
        super(props);

        this.onHeaderItemClick = this.onHeaderItemClick.bind(this);
        this.onAddButtonClick = this.onAddButtonClick.bind(this);

        this.state = {
            data: null,
            sortKey: null,
            sortReversed: false,

            isLoading: true,
        }
        this.initialize();
    }

    initialize() {
        this.props.loadDataItems().then(
            (response) => {
                console.log(response);
                this.setState({
                    data: response,
                    isLoading: false,
                });
            },
            (error) => {
                console.log(error)
            },
        )
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
        console.log(event.currentTarget.dataset.sortKey)
        return;
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

    onAddButtonClick() {

    }

    renderLoading() {
        return (
            <AnimatedEllipsis text="Loading" />
        )
    }

    renderError() {
        return (
            <div className='error-message'>Something happened while retrieving the shelf!</div>
        )
    }

    renderCreateRow() {
        return (
            <tr className="crud-table-create-row no-hover">
                <td colSpan="100%">
                    <button onClick={this.onAddButtonClick}>{this.props.createLabel}</button>
                </td>
            </tr>
        )
    }

    renderTableBody() {
        const { data } = this.state;
        return (
            <tbody>
                {
                    data.map((item, index) => (
                        <CRUDTableRow
                            item={item}
                            key={`crud-row-${item[this.props.itemKey]}`}
                            itemKey={this.props.itemKey}
                            sortedHeaderItems={this.props.sortedHeaderItems}
                            itemFormatters={this.props.itemFormatters}
                        />
                    ))
                }
                {
                    this.props.createEnabled && this.renderCreateRow()
                }
            </tbody>
        )
    }

    renderTable() {
        return (
            <table id="crud-table">
                <CRUDTableHeader
                    sortedHeaderItems={this.props.sortedHeaderItems}
                    onHeaderItemClick={this.onHeaderItemClick}
                />
                { this.renderTableBody() }
            </table>
        )
    }

    render() {
        return (
            <div className="crud-table-container">
                { this.state.isLoading && this.renderLoading() }
                { !this.state.isLoading && this.renderTable() }
            </div>
        )
    }
}

CRUDTable.propTypes = {
    loadDataItems: PropTypes.func.isRequired,

    sortedHeaderItems: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    itemFormatters: PropTypes.object,

    itemKey: PropTypes.string.isRequired,

    createEnabled: PropTypes.bool.isRequired,
    createLabel: PropTypes.string.isRequired,
}


module.exports = CRUDTable;
