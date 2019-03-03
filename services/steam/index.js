const config = require('../../app.config');
const fetch = require('node-fetch');
const STEAM_API_URL = 'http://api.steampowered.com';
const STEAM_SPY_API_URL = 'http://steamspy.com';

async function resolveNameToId(steamName) {
    return fetch(`${STEAM_API_URL}/ISteamUser/ResolveVanityURL/v0001/?key=${config.API_KEY}&vanityurl=${steamName}`)
            .then(response => response.json())
            .then(json => json.response.steamid)
            .catch(error => console.error(error));
}

async function getGamesById(steamId) {
    return fetch(`${STEAM_API_URL}/IPlayerService/GetOwnedGames/v0001/?key=${config.API_KEY}&steamid=${steamId}&format=json`)
        .then(response => response.json())
        .then(json => json.response.games)
        .then(games => games.map(game => game.appid))
        .catch(error => console.error(error));
}

async function getGameDetails(gameId) {
    return fetch(`${STEAM_SPY_API_URL}/api.php?request=appdetails&appid=${gameId}`)
        .then(response => response.json())
        .then(json => {
            return { name: json.name, tags: json.tags }
        })
}

module.exports = {
    resolveNameToId,
    getGamesById,
    getGameDetails
};