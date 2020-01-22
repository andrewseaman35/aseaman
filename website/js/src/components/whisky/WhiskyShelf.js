import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import WhiskyRow from './WhiskyRow';

import { TABLE_COLUMN_ORDER, TABLE_COLUMN_HEADER_LABELS } from './constants';
import { getAPIUrl } from '../../utils';


class WhiskyShelf extends React.Component {
    constructor() {
        super();
        this.state = {
            editing: {
                enabled: false,
                index: null,
            },
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
                    response.sort((a, b) => {
                        let aKey = a.distillery + a.internal_name;
                        let bKey = b.distillery + b.internal_name;
                        return aKey < bKey ? -1 : 1;
                    })
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
        const { editing, items } = this.state;
        return (
            <tbody>
                {
                    items.map((item, index) => (
                        <WhiskyRow
                            editable={editing.index === index}
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
