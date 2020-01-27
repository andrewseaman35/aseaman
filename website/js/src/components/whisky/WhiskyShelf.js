import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import $ from 'jquery';

import AUTH from '../../auth';

import WhiskyRow from './WhiskyRow';
import WhiskyForm from './WhiskyForm';

import { TABLE_COLUMN_ORDER, TABLE_COLUMN_HEADER_LABELS } from './constants';
import { getAPIUrl } from '../../utils';


class WhiskyShelf extends React.Component {
    constructor() {
        super();
        this.isAuthed = AUTH.getApiKey();

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

    renderActionHeaderItem() {
        if (!this.isAuthed) {
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
                        TABLE_COLUMN_ORDER.map((item, index) => (
                            <th key={index}>
                                {TABLE_COLUMN_HEADER_LABELS[item]}
                            </th>
                        ))
                    }
                    { this.renderActionHeaderItem() }
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
                            onWhiskyRemoved={this.props.onWhiskyRemoved}
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
    loading: PropTypes.bool.isRequired,
    failed: PropTypes.bool.isRequired,
    items: PropTypes.array,
}


module.exports = WhiskyShelf;
