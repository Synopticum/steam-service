module.exports = async function (fastify, opts) {
    fastify
        .register(registerRoutes);
};

async function registerRoutes(fastify, opts) {
    fastify.route({
        method: 'GET',
        url: '/test',
        handler: getTest
    });
}

async function getTest(request, reply) {
    reply.type('application/json').code(200);
    return { test: 'ololo' };
}