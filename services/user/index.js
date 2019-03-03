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
        handler: sendGamesChunked
    });
}

async function sendGamesChunked(request, reply) {
    let buffer = new stream.Readable();
    buffer._read = ()=>{};

    let user = request.params.user;
    let steamId = isSteamId(user) ? request.params.user : await steam.resolveNameToId(user);
    let gamesIds = await steam.getGamesById(steamId);

    let count = gamesIds.length;
    let emit = async () => {
        let data = await steam.getGameDetails(gamesIds[count]);
        console.log(`sending "${data}"`);
        buffer.push(JSON.stringify(data));

        count--;
        if (count > 0) {
            setTimeout(emit, 250);
        }
        else {
            console.log('end sending.');
            buffer.push(null);
        }
    };

    await emit();
    reply.type('text/html').send(buffer);
}

async function getGames(request, reply) {
    let user = request.params.user;
    let steamId = isSteamId(user) ? request.params.user : await steam.resolveNameToId(user);

    // get user's games (ids)
    let gamesIds = await steam.getGamesById(steamId);

    // get games details by ids
    let gamesDetails = await steamspy.getGamesDetails(gamesIds);

    reply.type('application/json').code(200);
    return gamesDetails;
}


// TODO
function isSteamId(user) {
    return user.toString().length === 17;
}