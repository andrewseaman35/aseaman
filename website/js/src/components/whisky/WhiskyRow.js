import React from 'react';
import PropTypes from 'prop-types';

import AUTH from '../../auth';

import { removeWhisky } from './api';
import { TABLE_COLUMN_ORDER } from './constants';
import Icon from '../icon/Icon';


class WhiskyRow extends React.Component {
    constructor() {
        super();
        this.isAuthed = AUTH.getApiKey();

        this.handleRemove = this.handleRemove.bind(this);
        this.onEditClicked = this.onEditClicked.bind(this);
    }

    handleRemove(item) {
        const distillery = item.distillery;
        const name = item.name;

        removeWhisky(distillery, name).then(
            () => {
                this.props.onWhiskyRemoved(distillery, name);
            },
            (errorResponse) => {
                console.log(errorResponse);
            },
        );
    }

    onEditClicked(item) {
        this.props.onStartEditWhisky(item.distillery, item.name);
    }

    renderActionDataItem(item) {
        if (!this.isAuthed) {
            return null;
        }
        return (
            <td key={Object.keys(TABLE_COLUMN_ORDER).length} className="actions">
                <button
                    className="button-icon whisky-action"
                    onClick={() => this.onEditClicked(item)}
                >
                    <Icon icon="pencil" size={24} />
                </button>

                <button
                    className="button-icon whisky-action"
                    onClick={() => this.handleRemove(item)}
                >
                    <Icon icon="trashcan" size={24} />
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
    onStartEditWhisky: PropTypes.func.isRequired,
    item: PropTypes.object,
}

module.exports = WhiskyRow;
