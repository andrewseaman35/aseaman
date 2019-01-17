function loadScript(url, callback) {
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
}

const googleTagManagerUrl = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_TRACKING_ID}`;
loadScript(googleTagManagerUrl, function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', CONFIG.GA_TRACKING_ID);
});
