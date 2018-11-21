const API_HOSTNAME = `https://${CONFIG.API_ID}.execute-api.us-east-1.amazonaws.com/test`;

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
    }
};
xhttp.open('GET', API_HOSTNAME, true);
xhttp.send();
