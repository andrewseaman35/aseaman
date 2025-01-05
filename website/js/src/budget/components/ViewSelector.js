import React from 'react';
import PropTypes from 'prop-types';

const ViewSelector = (props) => {
    return (
        <div className="view-selector">
            {
                props.views.map((view) => (
                    <div
                        className={`view-option ${view === props.selectedView ? 'selected' : ''}`}
                        onClick={() => props.onViewChanged(view)}
                        key={view}
                    >{view}</div>
                    )
                )
            }
        </div>
    )
}

ViewSelector.defaultProps = {
    selectedView: null,
};

ViewSelector.propTypes = {
    selectedView: PropTypes.string,
    onViewChanged: PropTypes.func.isRequired,
};

export default ViewSelector;