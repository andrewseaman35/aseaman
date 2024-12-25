import React, { useEffect, useState, } from 'react';
import PropTypes from 'prop-types';

const VIEWS = ['summary', 'transactions', 'upload'];

const ViewSelector = (props) => {

    return (
        <div className="view-selector">
            {
                VIEWS.map((view) => (
                    <div
                        className={`view-option ${view === props.selectedView ? 'selected' : ''}`}
                        onClick={() => props.onViewChanged(view)}
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