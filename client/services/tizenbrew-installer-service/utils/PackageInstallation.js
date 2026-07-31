const { execFileSync } = require('child_process');
const xml2js = require('xml2js');
const JSZip = require('jszip');

// Only wascmd is implemented, as pkgcmd (or native apps) are not available in Tizen 3.

function installPackage(packagePath, id, adbClient) {
    if (adbClient) {
        return new Promise((resolve, reject) => {
            var stream;
            var uninstalled = false;

            // First try to uninstall any residual installation
            var uninstallStream;
            try {
                uninstallStream = adbClient.createStream(`shell:0 vd_appuninstall ${id}`);
            } catch (e) {
                // Ignore uninstall errors, proceed to install
            }
            if (uninstallStream) {
                uninstallStream.on('data', () => {});
                uninstallStream.on('end', () => {
                    console.log('[installPackage] uninstall attempt completed for', id);
                    doInstall();
                });
                uninstallStream.on('close', () => {
                    console.log('[installPackage] uninstall stream closed for', id);
                    doInstall();
                });
                uninstallStream.on('error', () => {
                    console.log('[installPackage] uninstall error, proceeding to install');
                    doInstall();
                });
                // Fallback timeout in case uninstall stream doesn't close
                setTimeout(() => {
                    if (!uninstalled) doInstall();
                }, 3000);
            } else {
                doInstall();
            }

            function doInstall() {
                if (uninstalled) return;
                uninstalled = true;
                try {
                    stream = adbClient.createStream(`shell:0 vd_appinstall ${id} ${packagePath}`);
                } catch (e) {
                    return reject(new Error('Failed to create ADB stream: ' + e.message));
                }
                let data = '';
                stream.on('data', (chunk) => {
                    data += `${chunk}\n`;
                    console.log('[installPackage] vd_appinstall output chunk:', chunk.toString());
                    if (data.indexOf('spend time') !== -1) resolve(data);
                });
                stream.on('error', (error) => {
                    console.error('[installPackage] stream error:', error);
                    reject(new Error(`ADB Error: ${error}`));
                });
                stream.on('end', () => {
                    console.log('[installPackage] stream ended, full output:', data);
                    resolve(data);
                });
                stream.on('close', () => {
                    console.log('[installPackage] stream closed, full output:', data);
                    resolve(data);
                });
            }
        });
    }
    try {
        const output = execFileSync('wascmd', ['-i', id, '-p', packagePath], { encoding: 'utf8' });
        return Promise.resolve(output);
    } catch (error) {
        return Promise.reject(new Error(`Failed to install package: ${error.message}`));
    }
}

function parsePackage(buffer) {
    // Only WGT packages are supported, as Tizen 3 does not support native apps.
    const parser = new xml2js.Parser();
    return JSZip.loadAsync(buffer)
        .then(zip => {
            const isWgt = Object.keys(zip.files).indexOf('config.xml') !== -1;
            const configXmlFile = isWgt ? zip.files['config.xml'] : zip.files['tizen-manifest.xml'];
            if (configXmlFile) {
                return configXmlFile.async('string')
                    .then(xmlString => parser.parseStringPromise(xmlString))
                    .then(result => {
                        let packageId;
                        if (!isWgt) {
                            packageId = result.manifest.$.package;
                        } else {
                            packageId = result.widget['tizen:application'][0].$.package;
                        }
                        return {
                            packageId,
                            isWgt
                        };
                    });
            } else {
                return Promise.reject(new Error('No config.xml or tizen-manifest.xml found in package'));
            }
        });
}

module.exports = {
    installPackage,
    parsePackage
};