import React from 'react';
import _ from 'lodash';

import { list } from './components/salt_level/api';

const CONFIG = require('./config');
const LOCAL = CONFIG.STACKNAME === 'local';


class SaltLevel extends React.Component {
    componentDidMount() {
        if (!LOCAL) { return; }
        list('softener_one')
            .then(
                (response) => { console.log(response); },
                (err) => { console.log(err); },
            );
    }

    render() {
        if (!LOCAL) {
            return <div className="inner">-- under construction --</div>
        }
        return (
            <div className="inner"></div>
        )
    }
}

module.exports = SaltLevel;
