import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../icon/Icon';


class CRUDTableHeader extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <thead>
                <tr>
                    {
                        this.props.sortedHeaderItems.map((item, index) => {
                            const isSortedByThisKey = this.props.sortKey === item.key;
                            const icon = this.props.sortReversed ? 'caretDown' : 'caretUp';
                            return (
                                <th onClick={this.props.onHeaderItemClick} key={index} data-sort-key={item.key}>
                                    {item.label}
                                    {
                                        isSortedByThisKey && (
                                            <Icon
                                                icon={icon}
                                                size={16}
                                            />
                                        )
                                    }
                                </th>
                            );
                        })
                    }
                </tr>
            </thead>
        )
    }
}

CRUDTableHeader.propTypes = {
    sortKey: PropTypes.string,
    sortReversed: PropTypes.bool,
    sortedHeaderItems: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,

    onHeaderItemClick: PropTypes.func.isRequired,
}


module.exports = CRUDTableHeader;
