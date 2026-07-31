const fetch = require('node-fetch');

function fetchLatestRelease(repo) {
    const url = `https://api.github.com/repos/${repo}/releases/latest`;
    return fetch(url, {
        headers: {
            'User-Agent': 'TizenBrew-Installer'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => data)
        .catch(err => {
            throw new Error(`Failed to fetch release: ${err.message}`);
        });
}

module.exports = {
    fetchLatestRelease
};