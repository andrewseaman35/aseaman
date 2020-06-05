import React from 'react';
import PropTypes from 'prop-types';


const VillagerCard = (props) => {
    const outerClass = `villager ${props.forCompare ? 'compare-card' : ''} ${props.class}`;
    const onClick = props.onClick ? props.onClick : () => {};
    const role = props.onClick ? "button" : "";
    const summary = props.summary;
    const record = summary ? `  (${summary.wins} - ${summary.losses})` : '';

    return (
        <div className={outerClass} onClick={onClick} role={role}>
            <div className="compare-inner">
                <img src={props.imageUrl}></img>
                <div className="detail-container">
                    <div className="name-and-record">
                        <span className="name">{props.name}</span>
                        { record && <span className="record">{record}</span> }
                    </div>
                    <table className="detail-table">
                        <tbody>
                            <tr>
                                <td className="detail-label">Gender: </td>
                                <td className="detail-value">{props.gender === 'M' ? 'Male' : 'Female'}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Personality: </td>
                                <td className="detail-value">{props.personality}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Species: </td>
                                <td className="detail-value">{props.species}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Birthday: </td>
                                <td className="detail-value">{props.birthday}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Catch Phrase: </td>
                                <td className="detail-value">{props.catchPhrase}</td>
                            </tr>
                            <tr>
                                <td className="detail-label">Hobbies: </td>
                                <td className="detail-value">{props.hobbies}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

VillagerCard.defaultProps = {
    forCompare: false,
    onClick: null,
    summary: null,
    class: '',
};

VillagerCard.propTypes = {
    name: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    personality: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    birthday: PropTypes.string.isRequired,
    catchPhrase: PropTypes.string.isRequired,
    hobbies: PropTypes.string.isRequired,

    class: PropTypes.string.isRequired,
    forCompare: PropTypes.bool,
    onClick: PropTypes.func,
    summary: PropTypes.shape({
        wins: PropTypes.number.isRequired,
        losses: PropTypes.number.isRequired,
    }),
};

module.exports = VillagerCard;
