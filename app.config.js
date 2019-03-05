const config = {
    get PORT() {
        return getValueFor('port');
    },

    get URI() {
        return getValueFor('uri');
    },

    get API_KEY() {
        return getValueFor('apiKey');
    },

    get MODE() {
        return getValueFor('mode');
    },
};

function getValueFor(argument) {
    let label = process.argv.indexOf(`--${argument}`);

    if (label >= 0 && label < process.argv.length - 1) {
        return process.argv[label + 1];
    }

    return '';
}

if (!config.PORT || !config.URI || !config.API_KEY || !config.MODE) {
    const checkMark = '\x1b[32m✔';
    const xMark = '\x1b[31m✘';

    throw new Error(`
        Some required params haven't been provided:
        
        \x1b[37m Port:---------------${config.PORT ? `${config.PORT} ${checkMark}` : xMark}
        \x1b[37m Server URI:---------${config.URI ? `${config.URI} ${checkMark}` : xMark}
        \x1b[37m API Key:------------${config.API_KEY ? `${config.API_KEY} ${checkMark}` : xMark}
        \x1b[37m Mode:---------------${config.MODE ? `${config.MODE} ${checkMark}` : xMark}
        \x1b[37m`);
}

module.exports = config;