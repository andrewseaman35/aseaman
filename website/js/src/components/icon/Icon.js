import React from 'react';
import PropTypes from 'prop-types';

import iconDefinitions from './definitions';

class Icon extends React.Component {
    render() {
        return (
            <svg
                height={this.props.size}
                width={this.props.size}
                viewBox="0 0 12 16"
                version="1.1"
                aria-hidden="true">
                {iconDefinitions[this.props.icon]}
            </svg>
        )
    }
}

Icon.defaultProps = {
    size: 12,
}

Icon.propTypes = {
    icon: PropTypes.string.isRequired,
    size: PropTypes.number,
}

module.exports = Icon;
