import React from 'react';

function Loading({ label }) {
    return (
        <div className="splitomatic-loading">
            <div className="splitomatic-loading-inner">
                <div className="splitomatic-loading-icon" />
                <span className="splitomatic-loading-label">{label}</span>
            </div>
        </div>
    );
}

export default Loading;