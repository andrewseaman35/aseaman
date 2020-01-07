import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import { getAPIUrl } from '../../utils';

const TABLE_COLUMN_ORDER = [
    'distillery',
    'internal_name',
    'region',
    'type',
];
const TABLE_COLUMN_HEADER_LABELS = {
    distillery: 'Distillery',
    internal_name: 'Name (internal)',
    region: 'Region',
    type: 'Type',
};


class WhiskyShelf extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            failed: false,
            items: null,
        };

        this.url = getAPIUrl('whisky');
        this.initializeShelf = this.initializeShelf.bind(this);
        this.retrieveCurrentShelf = this.retrieveCurrentShelf.bind(this);
        this.renderTableBody = this.renderTableBody.bind(this);
        this.renderTableHeader = this.renderTableHeader.bind(this);
    }

    componentDidMount() {
        this.initializeShelf();
    }

    initializeShelf() {
        this.retrieveCurrentShelf()
            .then(
                (response) => {
                    this.setState({
                        loading: false,
                        items: response,
                    })
                },
                () => {
                    this.setState({
                        loading: false,
                        failed: true,
                    })
                }
            );
    }

    retrieveCurrentShelf() {
        return $.ajax({
            type: 'POST',
            url: this.url,
            data: JSON.stringify({
                action: 'get_current_shelf'
            }),
            contentType: 'application/json',
        }).promise();
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
        const { items } = this.state;
        return (
            <tbody>
                {
                    items.map((item, index) => (
                        <tr key={index}>
                            {
                                TABLE_COLUMN_ORDER.map((columnKey, columnKeyIndex) => (
                                    <td key={columnKeyIndex}>{item[columnKey]}</td>
                                ))
                            }
                        </tr>
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
        if (this.state.loading) {
            return this.renderLoading();
        }
        if (this.state.failed) {
            return this.renderError();
        }

        return (
            <div className="whisky-shelf">
                { this.renderTable() }
            </div>
        )
    }
}

function initWhiskyShelf(elementId) {
    ReactDOM.render(
        <WhiskyShelf />,
        document.getElementById(elementId),
    );
}


module.exports = { initWhiskyShelf };
