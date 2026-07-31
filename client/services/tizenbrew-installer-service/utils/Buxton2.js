const { execFileSync } = require('child_process');

function getValue(valueName) {
    try {
        const cmd = execFileSync('buxton2ctl', ['get', 'system', valueName], { encoding: 'utf8' });
        const value = cmd.split(':')[1].trim();
        return value;
    } catch (e) {
        throw new Error('Failed to get buxton value ' + valueName + ': ' + e.message);
    }
}

function setValue(valueName, type, value) {
    try {
        execFileSync('buxton2ctl', ['set-' + type, 'system', valueName, value], { encoding: 'utf8' });
    } catch (e) {
        throw new Error('Failed to set buxton value ' + valueName + ': ' + e.message);
    }
}

function getDuid(adbClient, isTV) {
    return new Promise((resolve, reject) => {
        var stream;
        try {
            stream = adbClient.createStream('shell:0 getduid')
        } catch (e) {
            return reject(new Error('Failed to create ADB stream for getduid: ' + e.message));
        }
        var resolved = false;
        stream.on('data', (data) => {
            const duid = data.toString().trim();
            if (resolved) return;
            resolved = true;
            if (adbClient._stream && isTV) {
                adbClient._stream.removeAllListeners('connect');
                adbClient._stream.removeAllListeners('error');
                adbClient._stream.removeAllListeners('close');
                adbClient._stream.end();
                adbClient._stream.destroy();
                adbClient._stream = null;
                adbClient = null;
            }
            resolve(duid);
        });
        stream.on('error', (error) => {
            if (!resolved) reject(error);
        });
    });
}

module.exports = {
    getValue,
    setValue,
    getDuid
};