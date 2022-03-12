import React from 'react';
import PropTypes from 'prop-types';


class CRUDTableRow extends React.Component {
    constructor() {
        super();
        this.formatDataItem = this.formatDataItem.bind(this);

        this.state = {
            editedValues: {}
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

    renderEditableDataItems() {
        const { item } = this.props;
        const dataItems = this.props.sortedMetadata.map(
            (metadata, index) => {
                const key = metadata.key;
                const value = this.formatDataItem(metadata.key, item[metadata.key]);

                if (!metadata.editable) {
                    return this.renderTd(item, key, index);
                }

                return (
                    <td key={`${item[metadata.key]}-${index}`}>
                        <input
                            type={metadata.type}
                            value={value}
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
            <td>
                {
                    !this.props.isBeingEdited && (
                        <button onClick={() => this.props.onEditClick(key)}>Edit</button>
                    )
                }
                {
                    this.props.isBeingEdited && (
                        <button onClick={() => this.props.onSaveClick(key)}>Save</button>
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
}

module.exports = CRUDTableRow;
