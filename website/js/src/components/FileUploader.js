import React from 'react';


const FileUploader = (props) => {
    const accept = props.accept || "text/csv, application/pdf";
    const upload = () => {
        let file = document.getElementById(props.inputId).files[0];
        var fr = new FileReader();
        fr.onload = function () {
            var binaryString = this.result;
            props.upload(binaryString, file.type);
        };

        fr.readAsArrayBuffer(file);
    }

    return (
        <>
            <input
                id={props.inputId}
                type="file"
                name="file"
                accept={accept}
            ></input>
            <button onClick={upload}>Upload</button>
        </>
    )
}


export default FileUploader;