import $ from 'jquery';
import _ from 'lodash';


function shiftIndex(multiImageContainer, forwards) {
    const imgContainers = $(multiImageContainer).find('.img-container');
    const activeIndex = _.findIndex(imgContainers, (ic) => !$(ic).hasClass('hide'));
    const shift = forwards ? 1 : -1;
    const nextActiveIndex = (
        activeIndex === 0 && !forwards ? imgContainers.length :
        (activeIndex + shift) % imgContainers.length
    );
    _.forEach(imgContainers, (imgContainer, index) => {
        if (index !== nextActiveIndex) {
            $(imgContainer).addClass('hide');
        } else {
            $(imgContainer).removeClass('hide');
        }
    });
}


function initMultiImageContainers() {
    const multiImageContainers = $('.main-content .multi-image-container');

    _.forEach(multiImageContainers, (multiImageContainer) => {
        const previousButton = $(multiImageContainer).find('.arrow-icon.previous');
        const nextButton = $(multiImageContainer).find('.arrow-icon.next');
        const imgContainers = $(multiImageContainer).find('.img-container');
        _.forEach(imgContainers, (imgContainer) => {
            $(imgContainer).addClass('hide')
        });
        $(imgContainers[0]).removeClass('hide');

        nextButton.click(() => { shiftIndex(multiImageContainer, true); })
        previousButton.click(() => { shiftIndex(multiImageContainer, false); })
    });
}

module.exports = initMultiImageContainers;
