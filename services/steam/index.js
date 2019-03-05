const config = require('../../app.config');
const fetch = require('node-fetch');
const STEAM_API_URL = 'http://api.steampowered.com';

let games = {};

switch (config.MODE) {
    case 'static':
        games = require('../../db/db');
        break;

    case 'dynamic':
        _watchForGamesDb().catch(_handleDbUpdateError);
        break;
}

async function fetchMultiPlayerGames() {
    return fetch('http://steamspy.com/api.php?request=genre&genre=Multiplayer')
        .then(response => response.json());
}

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
        .catch(error => console.error('Steam ID not found'));
}

async function getMultiPlayerGames(gamesIds) {
    return gamesIds
        .filter(gameId => games[gameId])
        .map(gameId => games[gameId])
        .map(game => game.name);
}

async function _watchForGamesDb() {
    const hour = 3600000;

    return fetchMultiPlayerGames()
        .then(updatedGames => {
            _updateDb(updatedGames);

            setInterval(() => fetchMultiPlayerGames()
                .then(updatedGames => _updateDb(updatedGames))
                .catch(_handleDbUpdateError), hour);
        })
}

function _updateDb(updatedGames) {
    games = updatedGames;
    console.log(`Games DB updated at ${new Date()}`);
}

function _handleDbUpdateError(e) {
    console.error('Database update error when fetching', e);
}

module.exports = {
    resolveNameToId,
    getGamesById,
    getMultiPlayerGames
};