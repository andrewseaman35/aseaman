import React from 'react';

import { initWhiskyShelf } from './whisky/WhiskyShelf';

import Icon from './icon/Icon';
import Lightbox from './Lightbox';
import Modal from './modal/Modal';
import WhiskyShelf from './whisky/WhiskyShelf';
import WhiskyForm from './whisky/WhiskyForm';


class AnimatedEllipsis extends React.Component {
    render() {
        const {classes, text} = this.props;
        return (
            <div className={`animated-ellipsis ${classes ? classes : ''}`}>
                {text}<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
            </div>
        )
    }
}


module.exports = {
    AnimatedEllipsis,
    Icon,
    Lightbox,
    Modal,
    WhiskyForm,
    WhiskyShelf,

    initWhiskyShelf,
};
