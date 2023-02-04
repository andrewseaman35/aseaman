import React from 'react';

import Icon from './icon/Icon';
import Lightbox from './Lightbox';
import Modal from './modal/Modal';


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
};
