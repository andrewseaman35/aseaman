import React from 'react';
import PropTypes from 'prop-types';


class CRUDTableRow extends React.Component {
    constructor() {
        super();
        this.formatDataItem = this.formatDataItem.bind(this);
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

    renderDataItems() {
        const { item } = this.props;
        const dataItems = this.props.sortedHeaderItems.map(
            (headerItem, index) => (
                <td key={`${item[headerItem.key]}-${index}`}>
                    {this.formatDataItem(headerItem.key, item[headerItem.key])}
                </td>
            )
        );

        return dataItems;
    }

    render() {
        return (
            <tr>
                {this.renderDataItems()}
            </tr>
        )
    }
}

CRUDTableRow.propTypes = {
    item: PropTypes.object,
    itemKey: PropTypes.string.isRequired,
    sortedHeaderItems: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    itemFormatters: PropTypes.object,
}

module.exports = CRUDTableRow;
