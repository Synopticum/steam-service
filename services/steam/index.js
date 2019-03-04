const config = require('../../app.config');
const fetch = require('node-fetch');
const multiPlayerGamesDb = require('../../db/db.json');
const STEAM_API_URL = 'http://api.steampowered.com';

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

async function getMultiPlayerGames(gamesIds) {
    return gamesIds
        .filter(gameId => multiPlayerGamesDb[gameId])
        .map(gameId => multiPlayerGamesDb[gameId])
        .map(game => game.name);
}

module.exports = {
    resolveNameToId,
    getGamesById,
    getMultiPlayerGames
};