import React from 'react';
import PropTypes from 'prop-types';

import { TABLE_COLUMN_ORDER } from './constants';

class WhiskyRow extends React.Component {
    renderDataItems() {
        const { item } = this.props;
        return TABLE_COLUMN_ORDER.map((key, index) => (
            <td key={index}>{item[key]}</td>
        ))
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
    editable: PropTypes.bool,
    item: PropTypes.object,
}

module.exports = WhiskyRow;
