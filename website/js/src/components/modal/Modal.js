import React from 'react';
import PropTypes from 'prop-types';


class Modal extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className='modal'>
                {this.props.children}
            </div>
        );
    }
}

Modal.propTypes = {

}

module.exports = Modal;
