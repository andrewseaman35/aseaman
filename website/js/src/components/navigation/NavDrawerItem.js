import React from 'react';
import PropTypes from 'prop-types';

// import NestedNavDrawerItem from './NestedNavDrawerItem';

const NavDrawerItem = (props) => {
    const pathname = window.location.pathname;
    let isSelected = pathname === props.destination;

    if (props.nestedItems.length > 0) {
        const nestedDestinations = props.nestedItems.map(n => n.destination);
        isSelected |= nestedDestinations.includes(pathname);

        return (
            <div id={props.id} className={`navdrawer-nav-item ${isSelected ? 'selected' : ''}`}>
                { props.destination && (
                    <a className="navdrawer-nav-item-link unlinkify" href={props.destination}>
                        {props.label}
                    </a>
                )}
                { !props.destination && (
                    <span className="navdrawer-nav-item-link">{props.label}</span>
                )}
                <div className="navdrawer-nested-list">
                    {
                        props.nestedItems.map((item) => (
                            <a className="unlinkify" href={item.destination}>
                                <div className="nested-navdrawer-item" id={item.id}>
                                    {item.label}
                                </div>
                            </a>
                            // <NestedNavDrawerItem
                            //     key={`${props.id}-${item.id}`}
                            //     id={`${props.id}-${item.id}`}
                            //     label={item.label}
                            //     destination={item.destination}
                            // />
                        ))
                    }
                </div>
            </div>
        )
    }

    return (
        <div id={props.id} className={`navdrawer-nav-item ${isSelected ? 'selected' : ''}`}>
            <a className="navdrawer-nav-item-link unlinkify" href={props.destination}>
                {props.label}
            </a>
        </div>
    )
}

NavDrawerItem.defaultProps = {
    destination: null,
    nestedItems: [],
}

NavDrawerItem.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    destination: PropTypes.string,
    nestedItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        destination: PropTypes.string.isRequired,
    })),
}

export default NavDrawerItem;