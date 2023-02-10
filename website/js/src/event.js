import { trackEvent } from './event/api';


const track = function() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    const eventType = params.event_type;
    const eventId = params.event_id;
    if (!(eventType && eventId)) {
        window.location.replace('/index');
    }

    trackEvent(eventType, eventId).then(() => {
        window.location.replace('/index');
    }, () => {
        window.location.replace('/404')
    })
};


module.exports = {
    track
 };
