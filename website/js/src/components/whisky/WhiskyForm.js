import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../icon/Icon';

import { addWhisky } from './api';
import { ERROR_MESSAGE_BY_CODE } from './constants';


class WhiskyForm extends React.Component {
    constructor(props) {
        super(props);

        const { selectedWhisky } = props;
        this.state = {
            errorMessage: null,
            item: {
                distillery: selectedWhisky ? selectedWhisky.distillery : '',
                name: selectedWhisky ? selectedWhisky.name : '',
                country: selectedWhisky && selectedWhisky.country ? selectedWhisky.country : '',
                region: selectedWhisky && selectedWhisky.region ? selectedWhisky.region : '',
                type: selectedWhisky && selectedWhisky.type ? selectedWhisky.type : '',
                style: selectedWhisky && selectedWhisky.style ? selectedWhisky.style : '',
                age: selectedWhisky && selectedWhisky.age ? selectedWhisky.age : '',
            },
        }

        this.handleClose = this.handleClose.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateSubmission = this.validateSubmission.bind(this);
    }

    validateSubmission() {
        /**
         * Validates the values in the form before making the ajax request.
         * Doesn't do much yet.
         *
         * If submission is valid, returns `null`, otherwise, returns an error message string.
         */
        const {
            distillery, name, country, region, type, style, age
        } = this.state.item;

        if (distillery.length === 0 || name.length === 0) {
            return "Distillery and name must not be empty";
        }
        return null;
    }

    handleClose() {
        const {
            distillery, name, country, region, type, style, age
        } = this.state.item;
        const hasInput = !!(distillery + name + country + region + type + style + age.toString()).length;

        if (hasInput) {
            // Probably want to verify that we want to close here
        }

        this.props.onHideWhiskyForm();
    }

    handleChange(event) {
        const key = event.currentTarget.name;
        const value = event.currentTarget.value;
        this.setState({
            errorMessage: null,
            item: {
                ...this.state.item,
                [key]: value,
            },
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const { item } = this.state;
        const validationError = this.validateSubmission();
        if (validationError) {
            this.setState({ errorMessage: validationError });
            return;
        }

        addWhisky(item).then(
            (response) => {
                if (response.errorCode) {
                    const errorMessage = ERROR_MESSAGE_BY_CODE[response.errorCode] || 'error!';
                    this.setState({ errorMessage: errorMessage });
                } else {
                    if (!!this.props.selectedWhisky) {
                        this.props.onWhiskyUpdated(response);
                    } else {
                        this.props.onWhiskyAdded(response);
                    }
                    this.props.onHideWhiskyForm();
                }
            },
            (errorResponse) => {
                this.setState({ errorMessage: "Error!" });
            });
    }

    renderButtonContainer() {
        return (
            <div className='button-container'>
                <button className='button-icon' onClick={this.handleClose}>
                    <Icon icon='closeX' size={20} />
                </button>
            </div>
        )
    }

    renderInputField(label, key, type, disabled) {
        const value = this.state.item[key];
        return (
            <label>
                <span>{label}:</span>
                <input type={type} value={value} name={key} onChange={this.handleChange} disabled={disabled}/>
            </label>
        )
    }

    renderErrorMessage() {
        if (!this.state.errorMessage) {
            return null;
        }

        return (
            <div className='error-message'>{this.state.errorMessage}</div>
        )
    }

    render() {
        const isEditing = !!this.props.selectedWhisky;
        return (
            <div className='whisky-form'>
                { this.renderButtonContainer() }
                <h3>{ isEditing ? 'Edit Whisky' : 'New Whisky' }</h3>
                <form onSubmit={this.handleSubmit}>
                    { this.renderInputField('Distillery', 'distillery', 'text', isEditing) }
                    { this.renderInputField('Name', 'name', 'text', isEditing) }
                    { this.renderInputField('Country', 'country', 'text') }
                    { this.renderInputField('Region', 'region', 'text') }
                    { this.renderInputField('Type', 'type', 'text') }
                    { this.renderInputField('Style', 'style', 'text') }
                    { this.renderInputField('Age', 'age', 'number') }
                    { this.renderErrorMessage() }
                    <input type="submit" value="Save" />
                </form>
            </div>
        )
    }
}

WhiskyForm.propTypes = {
    selectedWhisky: PropTypes.object,
    onWhiskyAdded: PropTypes.func.isRequired,
    onWhiskyUpdated: PropTypes.func.isRequired,
    onHideWhiskyForm: PropTypes.func.isRequired,
}

module.exports = WhiskyForm;
