"use strict";

const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs');
const { homedir } = require('os');

function readConfig() {
    var defaultConfig = {
        authorCert: null,
        distributorCert: null,
        password: null
    };
    var configPath = require('path').join(homedir(), 'share', 'tizenbrewInstallerConfig.json');
    if (!existsSync(configPath)) {
        return defaultConfig;
    }
    try {
        var parsed = JSON.parse(readFileSync(configPath, 'utf8'));
        // Merge with defaults to ensure all fields exist
        return Object.assign(defaultConfig, parsed);
    } catch (e) {
        console.error('Failed to parse installer config, using defaults:', e);
        return defaultConfig;
    }
}

function writeConfig(config) {
    var shareDir = require('path').join(homedir(), 'share');
    var configPath = require('path').join(shareDir, 'tizenbrewInstallerConfig.json');
    if (!existsSync(shareDir)) {
        try {
            mkdirSync(shareDir, { recursive: true });
        } catch (e) {
            console.error('Failed to create share directory:', e);
            return;
        }
    }
    try {
        writeFileSync(configPath, JSON.stringify(config, null, 4));
    } catch (e) {
        console.error('Failed to write installer config:', e);
    }
}

module.exports = {
    readConfig,
    writeConfig
};