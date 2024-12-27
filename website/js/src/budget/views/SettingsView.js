import React, { useEffect, useState, } from 'react';

import FileUploader from '../../components/FileUploader';
import { uploadConfigFile } from '../api';

const SettingsView = () => {
    return (
        <div className="view-summary">
            <FileUploader
                inputId="config-file"
                upload={uploadConfigFile}
            />
        </div>
    );
}

export default SettingsView;