import React from 'react';
import PropTypes from 'prop-types';

import { loadUserLinks } from './api';
import { toReadableDateTime } from '../utils';

import CRUDTable from '../components/crud_table/CRUDTable';


const SORTED_HEADER_LABELS = [
    {'key': 'id', 'label': 'Link Id'},
    {'key': 'name', 'label': 'Name'},
    {'key': 'url', 'label': 'URL'},
    {'key': 'status', 'label': 'Status'},
    {'key': 'time_created', 'label': 'Time Created'},
    {'key': 'time_updated', 'label': 'Last Updated'},
];

const ITEM_FORMATTERS = {
    status: (s) => (
        {A: 'Active', I: 'Inactive', X: 'Deleted'}[s]
    ),
    time_created: toReadableDateTime,
    time_updated: toReadableDateTime,
}


class LinksTable extends React.Component {
    constructor() {
        super();

        this.state = {
            dataset: null,
        }
    }

    loadDataSet() {
        loadUserLinks().then(
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log(error)
            },
        )
    }

    render() {
        return (
            <CRUDTable
                loadDataItems={loadUserLinks}
                itemKey="id"

                sortedHeaderItems={SORTED_HEADER_LABELS}
                itemFormatters={ITEM_FORMATTERS}

                createEnabled={true}
                createLabel="New Link"
            />
        )
    }
}

LinksTable.propTypes = {
}


module.exports = LinksTable;
