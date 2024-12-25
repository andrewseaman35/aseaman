import React from 'react';
import $ from 'jquery';

import { getAPIUrl } from '../utils';
import { getToken } from '../auth';

export default class FileUploader extends React.Component {
    upload() {
        let file = document.getElementById("budget-file").files[0];
        var fr = new FileReader();
        fr.onload = function () {
            var binaryString = this.result;

            $.ajax({
                url: getAPIUrl('budget/file'),
                type: "POST",
                headers: {
                    Authorization: getToken(),
                },
                contentType: "text/plain",
                data: binaryString,
                processData: false,
                success: function (data) {
                    console.log(data)
                },
                error: function (xhr, status, error) {
                    console.log(error)
                }
            });

        };

        fr.readAsArrayBuffer(file);
    }

    render() {
        return (
            <>
                <input type="file" name="file" id="budget-file"></input>
                <button onClick={this.upload}>Upload</button>
            </>

        )
    }
}