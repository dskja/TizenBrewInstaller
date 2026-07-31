"use strict";

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { homedir } = require('os');

function readConfig() {
    var defaultConfig = {
        authorCert: null,
        distributorCert: null,
        password: null
    };
    if (!existsSync(`${homedir()}/share/tizenbrewInstallerConfig.json`)) {
        return defaultConfig;
    }
    try {
        return JSON.parse(readFileSync(`${homedir()}/share/tizenbrewInstallerConfig.json`, 'utf8'));
    } catch (e) {
        console.error('Failed to parse installer config, using defaults:', e);
        return defaultConfig;
    }
}

function writeConfig(config) {
    if (!existsSync(`${homedir()}/share`)) {
        mkdirSync(`${homedir()}/share`);
    }
    try {
        writeFileSync(`${homedir()}/share/tizenbrewInstallerConfig.json`, JSON.stringify(config, null, 4));
    } catch (e) {
        console.error('Failed to write installer config:', e);
    }
}

module.exports = {
    readConfig,
    writeConfig
};