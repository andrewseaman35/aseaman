import React from 'react';


const FileUploader = (props) => {
    const upload = () => {
        let file = document.getElementById(props.inputId).files[0];
        var fr = new FileReader();
        fr.onload = function () {
            var binaryString = this.result;
            props.upload(binaryString);
        };

        fr.readAsArrayBuffer(file);
    }

    return (
        <>
            <input type="file" name="file" id={props.inputId}></input>
            <button onClick={upload}>Upload</button>
        </>
    )
}


export default FileUploader;