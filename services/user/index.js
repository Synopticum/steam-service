const steam = require('../steam');
const stream = require('stream');

module.exports = async function (fastify, opts) {
    fastify
        .register(registerRoutes);
};

async function registerRoutes(fastify, opts) {
    fastify.route({
        method: 'GET',
        url: '/users/:user/games',
        handler: getGames
    });
}

async function getGames(request, reply) {
    let user = request.params.user;
    let steamId = isSteamId(user) ? request.params.user : await steam.resolveNameToId(user);

    let gamesIds = await steam.getGamesById(steamId);
    let gamesDetails = await steam.getMultiPlayerGames(gamesIds);

    reply.type('application/json').code(200);
    return gamesDetails;
}


// TODO
function isSteamId(user) {
    return user.toString().length === 17;
}