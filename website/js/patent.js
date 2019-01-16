const data = {
    state_id: 'patent_number'
};
$.post(
    "https://19bv595mn1.execute-api.us-east-1.amazonaws.com/test/state_check",
    JSON.stringify(data),
    function(response) {
        console.log(response)
    },
);
