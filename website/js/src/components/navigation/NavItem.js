import React from 'react';
import PropTypes from 'prop-types';

import NestedNavItem from './NestedNavItem';

const NavItem = (props) => {
    const pathname = window.location.pathname;
    let isSelected = pathname === props.destination;

    if (props.nestedItems.length > 0) {
        const nestedDestinations = props.nestedItems.map(n => n.destination);
        isSelected |= nestedDestinations.includes(pathname);

        return (
            <div id={props.id} className={`navbar-nav-item ${isSelected ? 'selected' : ''}`}>
                { props.destination && (
                    <a className="navbar-nav-item-link unlinkify" href={props.destination}>
                        {props.label}
                    </a>
                )}
                { !props.destination && (
                    <span className="navbar-nav-item-link">{props.label}</span>
                )}
                <div className="navbar-nested-list">
                    {
                        props.nestedItems.map((item) => (
                            <NestedNavItem
                                key={`${props.id}-${item.id}`}
                                id={`${props.id}-${item.id}`}
                                label={item.label}
                                destination={item.destination}
                            />
                        ))
                    }
                </div>
            </div>
        )
    }

    return (
        <div id={props.id} className={`navbar-nav-item ${isSelected ? 'selected' : ''}`}>
            <a className="navbar-nav-item-link unlinkify" href={props.destination}>
                {props.label}
            </a>
        </div>
    )
}

NavItem.defaultProps = {
    destination: null,
    nestedItems: [],
}

NavItem.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    destination: PropTypes.string,
    nestedItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        destination: PropTypes.string.isRequired,
    })),
}

export default NavItem;