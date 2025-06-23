import React, {useState, useEffect} from 'react';

import {
    isMobile
} from '../../utils';
import {
    loginUrl,
    logoutUrl,
    isLoggedIn,
} from '../../auth';

import TransformingIcon from '../icon/TransformingIcon';

import NAVIGATION_DEFINITION from './definition';
import NavItem from './NavItem';
import NavDrawerItem from './NavDrawerItem';

const Navigation = () => {
    const [mobile, setMobile] = useState(isMobile());
    const [navDrawerShown, setNavDrawerShown] = useState(false);
    const currentlyLoggedIn = isLoggedIn()

    const toggleNavDrawer = () => {
        setNavDrawerShown(!navDrawerShown);
    }

    useEffect(() => {
        const onWindowResize = () => {
            console.log(isMobile());
            setMobile(isMobile());
        };
        window.addEventListener('resize', onWindowResize);
        onWindowResize();
        return () => window.removeEventListener('resize', onWindowResize);
    }, []);

    const renderNavItems = (definition) => {
        const NavClass = mobile ? NavDrawerItem : NavItem;
        return definition.map((item) => {
            return (
                <NavClass
                    id={item.id}
                    label={item.label}
                    nestedItems={item.nestedItems}
                    destination={item.destination}
                ></NavClass>
            );
        });
    };

    if (!mobile) {
        return (
            <div className="navbar desktop">
                <div className="navbar-icon">
                    {/* <Icon icon="hamburger" size={24} viewbox="0 0 24 24" /> */}
                </div>
                <div className="navbar-entries">
                    {renderNavItems(NAVIGATION_DEFINITION)}
                </div>
                <div className="navbar-logout">
                    <a className="link-button small-link unlinkify" href={`${currentlyLoggedIn ? logoutUrl() : loginUrl()}`}>
                        {`${currentlyLoggedIn ? "Log out" : "Log in"}`}
                    </a>
                </div>
            </div>
        )
    }
    return (
        <>
            <div className="navbar mobile">
                <button className="hamburger-container button-icon" onClick={toggleNavDrawer}>
                    <TransformingIcon startIcon="hamburger" endIcon="close" transform={navDrawerShown} size={24} viewbox="0 0 24 24" />
                </button>
                <a className="link-button small-link unlinkify" href={`${currentlyLoggedIn ? logoutUrl() : loginUrl()}`}>
                    {`${currentlyLoggedIn ? "Log out" : "Log in"}`}
                </a>
            </div>
            <div className={`navdrawer ${navDrawerShown ? 'open' : 'closed'}`}>
                {renderNavItems(NAVIGATION_DEFINITION)}
            </div>
        </>
    )
}

export default Navigation;