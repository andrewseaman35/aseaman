import { trackEvent } from './event/api';


const track = function({ successRedirect, failureRedirect }) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const eventType = params.event_type;
    const eventId = params.event_id;
    if (!(eventType && eventId)) {
        window.location.replace(failureRedirect || "/404");
    }

    trackEvent(eventType, eventId).then(() => {
        window.location.replace(successRedirect || "/index");
    }, () => {
        window.location.replace(failureRedirect || "/404");
    })
};


module.exports = {
    track
 };
