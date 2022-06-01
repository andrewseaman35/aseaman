import React from 'react';
import PropTypes from 'prop-types';

import { deleteUserLink, loadUserLinks, saveNewUserLink, updateUserLink } from './api';
import { toReadableDateTime } from '../utils';

import CRUDTable from '../components/crud_table/CRUDTable';


const SORTED_METADATA = [
    {
        key: 'id',
        label: 'Link Id',
        editable: false,
        type: null,
    },
    {
        key: 'name',
        label: 'Name',
        editable: true,
        type: 'text',
    },
    {
        key: 'url',
        label: 'URL',
        editable: true,
        type: 'text',
    },
    {
        key: 'active',
        label: 'Active',
        editable: true,
        type: 'checkbox',
    },
    {
        key: 'time_created',
        label: 'Time Created',
        editable: false,
        type: null,
    },
    {
        key: 'time_updated',
        label: 'Last Updated',
        editable: false,
        type: null,
    },
];

const ITEM_FORMATTERS = {
    active: (s) => (
        {true: 'Active', false: 'Inactive'}[s]
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
        return loadUserLinks().then(
            (response) => {
                return response
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

                createItem={saveNewUserLink}
                updateItem={updateUserLink}
                deleteItem={deleteUserLink}

                sortedMetadata={SORTED_METADATA}
                itemFormatters={ITEM_FORMATTERS}

                createEnabled={true}
                createLabel="New Link"

                editEnabled={true}

                deleteEnabled={false}
            />
        )
    }
}

LinksTable.propTypes = {
}


module.exports = LinksTable;
