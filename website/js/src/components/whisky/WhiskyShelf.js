import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import $ from 'jquery';

import WhiskyRow from './WhiskyRow';
import WhiskyForm from './WhiskyForm';

import { TABLE_COLUMN_ORDER, TABLE_COLUMN_HEADER_LABELS } from './constants';
import { getAPIUrl } from '../../utils';


class WhiskyShelf extends React.Component {
    constructor() {
        super();
        this.renderTableBody = this.renderTableBody.bind(this);
        this.renderTableHeader = this.renderTableHeader.bind(this);
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

    renderTableHeader() {
        return (
            <thead>
                <tr>
                    {
                        TABLE_COLUMN_ORDER.map((item, index) => (
                            <th key={index}>
                                {TABLE_COLUMN_HEADER_LABELS[item]}
                            </th>
                        ))
                    }
                </tr>
            </thead>
        )
    }

    renderTableBody() {
        const { loading, items } = this.props;
        const sortedItems = items.concat().sort((a, b) => {
            let aKey = a.distillery.toLowerCase() + a.internal_name.toLowerCase();
            let bKey = b.distillery.toLowerCase() + b.internal_name.toLowerCase();
            return aKey < bKey ? -1 : 1;
        });
        return (
            <tbody>
                {
                    sortedItems.map((item, index) => (
                        <WhiskyRow
                            editable={false}
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
    loading: PropTypes.bool.isRequired,
    failed: PropTypes.bool.isRequired,
    items: PropTypes.array,
}


module.exports = WhiskyShelf;
