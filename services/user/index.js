const steam = require('../steam');

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

    if (gamesIds) {
        let gamesDetails = await steam.getMultiPlayerGames(gamesIds);
        reply.type('application/json').code(200);
        return gamesDetails;
    } else {
        reply.type('application/json').code(400);
        return { error: 'Steam ID not found' };
    }
}


function isSteamId(user) {
    // primitive check to allow enter either steam login or steam id
    // hope your steam login length !== 17 :-)
    return user.toString().length === 17;
}