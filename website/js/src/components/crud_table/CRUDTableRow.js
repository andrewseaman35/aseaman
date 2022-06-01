import React from 'react';
import PropTypes from 'prop-types';

import { AnimatedEllipsis } from '../index';

class CRUDTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.formatDataItem = this.formatDataItem.bind(this);

        this.state = {
            itemValues: {
                ...props.item,
            },
        }
    }

    formatDataItem(key, value) {
        if (!this.props.itemFormatters) {
            return value;
        }
        if (!(key in this.props.itemFormatters)) {
            return value
        }
        return this.props.itemFormatters[key](value);
    }

    handleChange(key, type, e) {
        const newValue = type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({
            ...this.state,
            itemValues: {
                ...this.state.itemValues,
                [key]: newValue,
            }
        })
    }

    renderEditableDataItems() {
        const { item } = this.props;
        const { itemValues } = this.state;

        const dataItems = this.props.sortedMetadata.map(
            (metadata, index) => {
                const key = metadata.key;
                const value = itemValues[metadata.key];

                if (!metadata.editable) {
                    return this.renderTd(itemValues, key, index);
                }
                return (
                    <td key={`${metadata.key} - ${index}`}>
                        <input
                            type={metadata.type}
                            value={value}
                            checked={value}
                            onChange={(e) => this.handleChange(metadata.key, metadata.type, e)}
                        >
                        </input>
                    </td>
                );
            }
        );

        return dataItems;
    }

    renderTd(item, key, index) {
        return (
            <td key={`${item[key]}-${index}`}>
                {this.formatDataItem(key, item[key])}
            </td>
        )
    }

    renderDataItem() {
        const { item } = this.props;
        const dataItems = this.props.sortedMetadata.map(
            (metadata, index) => (
                this.renderTd(item, metadata.key, index)
            )
        );

        return dataItems;
    }

    renderActionItems() {
        const key = this.props.item[this.props.itemKey];
        return (
            <td className="crud-table-action-items">
                {
                    this.props.isProcessingAction && (
                        <button className="no-hover" onClick={() => {}}>
                            <AnimatedEllipsis />
                        </button>
                    )
                }
                {
                    !this.props.isProcessingAction && !this.props.isBeingEdited && (
                        <button onClick={() => this.props.onEditClick(key)}>Edit</button>
                    )
                }
                {
                    !this.props.isProcessingAction && this.props.isBeingEdited && (
                        <button onClick={() => this.props.onSaveClick(key, this.state.itemValues)}>Save</button>
                    )
                }

            </td>
        )
    }

    render() {
        return (
            <tr>
                {this.props.isBeingEdited && this.renderEditableDataItems()}
                {!this.props.isBeingEdited && this.renderDataItem()}
                {this.props.editEnabled && this.renderActionItems()}
            </tr>
        )
    }
}

CRUDTableRow.propTypes = {
    item: PropTypes.object,
    itemKey: PropTypes.string.isRequired,
    sortedMetadata: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    itemFormatters: PropTypes.object,

    editEnabled: PropTypes.bool.isRequired,
    onEditClick: PropTypes.func,
    onSaveClick: PropTypes.func,

    isBeingEdited: PropTypes.bool.isRequired,
    isProcessingAction: PropTypes.bool.isRequired,
}

module.exports = CRUDTableRow;
