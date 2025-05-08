import React, { useState } from "react"
import PropTypes from 'prop-types';


const NestedNavItem = (props) => {
    const [swoop, setSwoop] = useState(false);

    const handleClick = (e) => {
        e.preventDefault(); // Stop default navigation
        setSwoop(true);

        setTimeout(() => {
            document.body.classList.add('leaving');
        }, 100);
        setTimeout(() => {
            window.location.href = props.destination;
        }, 300);
    };

    return (
        <a className="unlinkify" href='#' onClick={handleClick}>
            <div className={`nested-nav-item ${swoop ? 'swoop' : ''}`} id={props.id}>
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