import React from 'react';
import PropTypes from 'prop-types';


export const selectorItem = (label, value=null) => {
    if (value === null) {
        return {label: label, value: label};
    }
    return {label: label, value: value};
}


export const YEAR_SELECTOR_ITEMS = [
    selectorItem(2018), selectorItem(2019), selectorItem(2020),
    selectorItem(2021), selectorItem(2022), selectorItem(2023),
    selectorItem(2024), selectorItem(2025),
];
export const MONTH_SELECTOR_ITEMS = [
    selectorItem(1), selectorItem(2), selectorItem(3),
    selectorItem(4), selectorItem(5), selectorItem(6),
    selectorItem(7), selectorItem(8), selectorItem(9),
    selectorItem(10), selectorItem(11), selectorItem(12),
];

const ItemSelector = (props) => {
    if (props.items.length === 0) {
        return;
    }
    if (props.items.length !== props.selectedValues.length || props.items.length !== props.handlers.length) {
        throw new Error("ItemSelector props not all the same length");
    }

    const renderSelector = (groupKey, i) => {
        const selectorItems = props.items[i];
        const selected = props.selectedValues[i];
        const handler = props.handlers[i]
        return (
        <div className="selector-group" key={groupKey}>
            {selectorItems.map((item) => (
                <button
                    className={`${selected === item.value ? 'selected' : ''}`}
                    onClick={() => handler(selected === item.value ? null : item.value)}
                    key={item.value}
                >{item.label}</button>
            ))}
        </div>
        )
    }

    return (
        <div className="item-selector">
            { props.items.map((v, i) => renderSelector(v, i)) }
        </div>
    )
}

ItemSelector.defaultProps = {
    items: [],
    selectedValues: [],
    handlers: [],
};

ItemSelector.propTypes = {
    items: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    }))),
    selectedValues: PropTypes.array,
    handlers: PropTypes.arrayOf(PropTypes.func),
};

export default ItemSelector;