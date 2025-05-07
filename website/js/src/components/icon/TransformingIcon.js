import React from 'react';
import PropTypes from 'prop-types';

import iconDefinitions from './definitions';

const TransformingIcon = (props) => {
    const transformClass = props.transform ? `to-${props.endIcon}` : `to-${props.startIcon}`;
    return (
        <svg
            className={`transforming-icon ${props.startIcon} ${transformClass}`}
            height={props.size}
            width={props.size}
            viewBox={props.viewbox}
            version="1.1"
            aria-hidden="true">
            {iconDefinitions[props.startIcon]}
        </svg>
    )
}

TransformingIcon.defaultProps = {
    size: 12,
    viewbox: "0 0 12 16",
}

TransformingIcon.propTypes = {
    startIcon: PropTypes.string.isRequired,
    endIcon: PropTypes.string.isRequired,
    size: PropTypes.number,
    viewbox: PropTypes.string.isRequired,
    transform: PropTypes.bool.isRequired,
}

module.exports = TransformingIcon;
