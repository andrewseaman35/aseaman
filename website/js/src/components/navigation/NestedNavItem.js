import React from "react"
import PropTypes from 'prop-types';


const NestedNavItem = (props) => {
    return (
        <a className="unlinkify" href={props.destination}>
            <div className="nested-nav-item" id={props.id}>
                {props.label}
            </div>
        </a>
    )
}

NestedNavItem.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
}

export default NestedNavItem;