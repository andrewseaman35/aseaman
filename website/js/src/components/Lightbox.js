import $ from 'jquery';
import React from 'react';
import { isMobile, KEY_CODE } from '../utils';


class Lightbox extends React.Component {
    constructor() {
        super();

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.next = this.next.bind(this);
        this.previous = this.previous.bind(this);
        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.eventListenerMapping = {
            [KEY_CODE.ESCAPE]: this.close,
            [KEY_CODE.LEFT]: this.previous,
            [KEY_CODE.RIGHT]: this.next,
        };

        this.imagesByGroupId = {}
        this.state = {
            isOpen: false,
            currentGroup: null,
            currentImageIndex: 0,
            renderingAdHoc: false,
        }
    }

    componentDidMount() {
        let lightboxNum = 0;
        const imageElements = $('.main-content img');
        for (let i = 0; i < imageElements.length; i++) {
            const image = imageElements[i];
            const definedLightboxGroup = image.dataset['lbGroup'];
            const lightboxEnabled = image.dataset['lb'] === "true";

            if (lightboxEnabled || definedLightboxGroup) {
                const lightboxGroup = definedLightboxGroup || lightboxNum.toString();
                if (!(lightboxGroup in this.imagesByGroupId)) {
                    this.imagesByGroupId[lightboxGroup] = [];
                }
                const additionalClass = image.dataset['lbClass'] ? image.dataset['lbClass'] : '';
                this.imagesByGroupId[lightboxGroup].push({
                    caption: image.alt,
                    src: image.src,
                    class: additionalClass
                });
                image.style.cursor = 'pointer';
                image.addEventListener('click', (function(e) {
                    const src = e.currentTarget.src;
                    this.open(lightboxGroup, src);
                }).bind(this));
                lightboxNum += 1;
            }
        }
        $(document).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document).off('keydown', this.handleKeyDown);
    }

    getCurrentImage() {
        return this.imagesByGroupId[this.state.currentGroup][this.state.currentImageIndex];
    }

    getCurrentImageSrc() {
        return this.getCurrentImage().src;
    }

    getCurrentClass() {
        return this.getCurrentImage().class;
    }

    handleKeyDown() {
        if (!this.state.isOpen || !this.state.currentGroup) {
            return
        }
        if (!(event.code in this.eventListenerMapping)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.eventListenerMapping[event.code](event);
    }

    previous() {
        const currentGroupImages = this.imagesByGroupId[this.state.currentGroup];
        let nextImageIndex = (this.state.currentImageIndex - 1) % currentGroupImages.length;
        if (nextImageIndex < 0) {
            nextImageIndex = currentGroupImages.length - 1;
        }

        this.setState({
            currentImageIndex: nextImageIndex,
        });
    }

    next() {
        const currentGroupImages = this.imagesByGroupId[this.state.currentGroup];
        const nextImageIndex = (this.state.currentImageIndex + 1) % currentGroupImages.length;
        this.setState({
            currentImageIndex: nextImageIndex,
        });
    }

    close() {
        this.setState({
            renderingAdHoc: false,
            currentGroup: null,
            currentImageIndex: -1,
            isOpen: false,
        })
    }

    onCloseButtonClick(e) {
        if (e.target.dataset['closeLightbox'] === 'true') {
            this.close();
        }
    }

    open(group, imgSrc) {
        if (isMobile()) {
            return;
        }
        const imagesInGroup = this.imagesByGroupId[group];
        const imageIndex = imagesInGroup.map(function(e) { return e.src; }).indexOf(imgSrc);
        if (imageIndex === -1) {
            this.setState({
                renderingAdHoc: true,
                adHocSrc: imgSrc,
                isOpen: true,
            })
        } else if (imageIndex >= 0) {
            this.setState({
                currentGroup: group,
                currentImageIndex: imageIndex,
                isOpen: true,
            })
            this.forceUpdate();
        }
    }

    renderAdHocImage() {
        const src = this.state.adHocSrc;
        return (
            <div className="img-caption displayed">
                <img src={src} alt=""/>
            </div>
        )
    }

    renderImages() {
        const imagesInGroup = this.imagesByGroupId[this.state.currentGroup];

        if (imagesInGroup.length > 1) {
            const elements = [];
            for (let i = 0; i < imagesInGroup.length; i++) {
                const className = i === this.state.currentImageIndex ? 'img-caption displayed' : 'img-caption';
                const imageSrc = imagesInGroup[i].src;
                const imageCaption = imagesInGroup[i].caption;
                elements.push(
                    <div className={className} key={i}>
                        <img className='displayed' src={imageSrc} alt=""/>
                        <div className='caption'>{imageCaption}</div>
                    </div>
                )
            }
            return elements;
        }

        const image = this.getCurrentImage();
        return (
            <div className="img-caption displayed">
                <img src={image.src} alt=""/>
                <div className='caption'>{image.caption}</div>
            </div>
        )

    }

    renderDots() {
        const imagesInGroup = this.imagesByGroupId[this.state.currentGroup];
        if (imagesInGroup.length > 1) {
            const elements = [];
            for (let i = 0; i < imagesInGroup.length; i++) {
                const className = i === this.state.currentImageIndex ? 'lightbox-dot selected' : 'lightbox-dot';
                elements.push(
                    <div key={i} className={className}></div>
                )
            }
            return elements;
        }
        return null;
    }

    renderAdHoc() {
        return (
            <div className={`lightbox-container hide-sm`}>
                <div className="lightbox-close">
                    <img alt="Close" data-close-lightbox='true' src="/img/icons/close.svg" onClick={this.onCloseButtonClick} />
                </div>
                <div id='lightbox-outer' className='lightbox' data-close-lightbox='true' onClick={this.onCloseButtonClick}>
                    <div className="lightbox-content">
                        {this.renderAdHocImage()}
                    </div>
                </div>
            </div>
        )
    }

    render () {
        if (!this.state.isOpen) {

        }
        if (this.state.renderingAdHoc) {
            return this.renderAdHoc();
        }
        if (!this.state.currentGroup) {
            return null;
        }
        const disableArrowButton = this.imagesByGroupId[this.state.currentGroup].length === 1;
        const arrowButtonClass = disableArrowButton ? 'disabled' : '';
        return (
            <div className={`lightbox-container hide-sm ${this.getCurrentClass()}`}>
                <div className="lightbox-close">
                    <img alt="Close" data-close-lightbox='true' src="/img/icons/close.svg" onClick={this.onCloseButtonClick} />
                </div>
                <div id='lightbox-outer' className='lightbox' data-close-lightbox='true' onClick={this.onCloseButtonClick}>
                    <div id='lightbox-previous' className={`lightbox-control ${arrowButtonClass}`}>
                        <img alt="Previous" src="/img/icons/left_arrow.svg" onClick={this.previous} />
                    </div>
                    <div className="lightbox-content">
                        {this.renderImages()}
                    </div>
                    <div id='lightbox-next' className={`lightbox-control ${arrowButtonClass}`}>
                        <img alt="Next" src="/img/icons/right_arrow.svg" onClick={this.next} />
                    </div>
                </div>
                <div className="lightbox-dots">
                    {this.renderDots()}
                </div>
            </div>
        )
   }
}

module.exports = Lightbox;
