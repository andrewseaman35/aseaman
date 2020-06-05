import React from 'react';
import PropTypes from 'prop-types';

const TOGGLE = {
    LEFT: 'left',
    RIGHT: 'right',
}


class Toggle extends React.Component {
    constructor(props) {
        super(props);

        this.onLeftToggleClick = this.onLeftToggleClick.bind(this);
        this.onRightToggleClick = this.onRightToggleClick.bind(this);

        this.state = {
            active: props.startActive,
        }
    }

    onLeftToggleClick() {
        this.setState({ active: TOGGLE.LEFT }, () => {
            this.props.onLeftToggle();
        });
    }

    onRightToggleClick() {
        this.setState({ active: TOGGLE.RIGHT }, () => {
            this.props.onRightToggle();
        });
    }

    render() {
        const { active } = this.state;
        const { leftLabel, rightLabel } = this.props;

        const leftActive = active === TOGGLE.LEFT;
        const rightActive = active === TOGGLE.RIGHT;

        return (
            <div className="toggle">
                <button
                    className={`toggle-button left ${leftActive ? 'active' : ''}`}
                    onClick={this.onLeftToggleClick}
                    disabled={leftActive}
                >{leftLabel}</button>
                <button
                    className={`toggle-button right ${rightActive ? 'active' : ''}`}
                    onClick={this.onRightToggleClick}
                    disabled={rightActive}
                >{rightLabel}</button>
            </div>
        );
    }
}

Toggle.defaultProps = {
    startActive: TOGGLE.LEFT,
}


Toggle.propTypes = {
    leftLabel: PropTypes.string.isRequired,
    rightLabel: PropTypes.string.isRequired,
    startActive: PropTypes.string,
    onLeftToggle: PropTypes.func.isRequired,
    onRightToggle: PropTypes.func.isRequired,
};

module.exports = Toggle;
