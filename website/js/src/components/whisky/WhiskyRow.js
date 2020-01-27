import React from 'react';
import PropTypes from 'prop-types';

import AUTH from '../../auth';

import { removeWhisky } from './api';
import { TABLE_COLUMN_ORDER } from './constants';


class WhiskyRow extends React.Component {
    constructor() {
        super();
        this.isAuthed = AUTH.getApiKey();

        this.handleRemove = this.handleRemove.bind(this);
    }

    handleRemove(event) {
        const distillery = event.currentTarget.dataset.distillery;
        const internalName = event.currentTarget.dataset.internalName;

        removeWhisky(distillery, internalName).then(
            () => {
                this.props.onWhiskyRemoved(distillery, internalName);
            },
            (errorResponse) => {
                console.log(errorResponse);
            },
        );
    }

    renderActionDataItem(item) {
        if (!this.isAuthed) {
            return null;
        }
        return (
            <td key={Object.keys(TABLE_COLUMN_ORDER).length} className="actions">
                <button
                    data-distillery={item.distillery}
                    data-internal-name={item.internal_name}
                    onClick={this.handleRemove}
                >
                    Remove
                </button>
            </td>
        )
    }

    renderDataItems() {
        const { item } = this.props;
        const dataItems = TABLE_COLUMN_ORDER.map((key, index) => (
            <td key={index}>{item[key]}</td>
        ));

        if (this.isAuthed) {
            dataItems.push(this.renderActionDataItem(item));
        }
        return dataItems;
    }

    render() {
        return (
            <tr>
                { this.renderDataItems() }
            </tr>
        )
    }
}

WhiskyRow.propTypes = {
    onWhiskyRemoved: PropTypes.func.isRequired,
    item: PropTypes.object,
}

module.exports = WhiskyRow;
