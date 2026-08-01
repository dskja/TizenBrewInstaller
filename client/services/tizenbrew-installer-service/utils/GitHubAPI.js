const fetch = require('node-fetch');

function fetchLatestRelease(repo) {
    var cleanRepo = repo.trim();
    if (cleanRepo.charAt(cleanRepo.length - 1) === '/') {
        cleanRepo = cleanRepo.substring(0, cleanRepo.length - 1);
    }
    if (cleanRepo.indexOf('https://github.com/') === 0) {
        cleanRepo = cleanRepo.substring('https://github.com/'.length);
    } else if (cleanRepo.indexOf('http://github.com/') === 0) {
        cleanRepo = cleanRepo.substring('http://github.com/'.length);
    }
    var url = 'https://api.github.com/repos/' + cleanRepo + '/releases/latest';
    console.log('Fetching release from: ' + url);
    return fetch(url, {
        headers: {
            'User-Agent': 'TizenBrew-Installer',
            'Accept': 'application/vnd.github+json'
        }
    })
        .then(function(response) {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository or release not found: ' + cleanRepo + ' (404). Make sure the repo exists and has at least one published release.');
                }
                throw new Error('GitHub API error: ' + response.status + ' ' + response.statusText);
            }
            return response.json();
        })
        .then(function(data) {
            if (!data || !data.assets) {
                throw new Error('No release assets found for ' + cleanRepo);
            }
            return data;
        })
        .catch(function(err) {
            throw new Error('Failed to fetch release: ' + err.message);
        });
}

module.exports = {
    fetchLatestRelease
};