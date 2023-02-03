import React from 'react';
import PropTypes from 'prop-types';

import {
    deleteUserLink,
    generateQRCode,
    loadUserLinks,
    saveNewUserLink,
    updateUserLink,
} from './api';
import { toReadableDate } from '../utils';

import CRUDTable from '../components/crud_table/CRUDTable';

const DEFAULT_SORT = "+time_created";


const SORTED_METADATA = [
    {
        key: 'id',
        label: 'Link Id',
        editable: false,
        type: null,
        initialValue: null,
    },
    {
        key: 'name',
        label: 'Name',
        editable: true,
        type: 'text',
        initialValue: "My link",
    },
    {
        key: 'url',
        label: 'URL',
        editable: true,
        type: 'text',
        initialValue: "",
    },
    {
        key: 'active',
        label: 'Active',
        editable: true,
        type: 'checkbox',
        initialValue: false,
    },
    {
        key: 'time_created',
        label: 'Created',
        editable: false,
        type: null,
        initialValue: null,
    },
    {
        key: 'time_updated',
        label: 'Updated',
        editable: false,
        type: null,
        initialValue: null,
    },
];

const ITEM_FORMATTERS = {
    active: (s) => (
        {true: 'Active', false: 'Inactive'}[s]
    ),
    time_created: toReadableDate,
    time_updated: toReadableDate,
}


class LinksTable extends React.Component {
    constructor() {
        super();

        this.state = {
            dataset: null,
        }
    }

    generateAndDisplayQRCode(key) {
        return generateQRCode(key).then((r) => {
            const src = r.replace(/\"/g, "");
            console.log(src)
            console.log(`data:image/png;base64,${src}`)
            document.getElementById("qr-code-img").src = `data:image/png;base64, ${src}`
            document.getElementById("qr-code-img").click();
        })
    }

    render() {
        return (
            <CRUDTable
                loadDataItems={() => loadUserLinks({sort: DEFAULT_SORT})}
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

                actionEnabled={true}
                actionIcon="share"
                handleAction={this.generateAndDisplayQRCode.bind(this)}
            />
        )
    }
}

LinksTable.propTypes = {
}


module.exports = LinksTable;
