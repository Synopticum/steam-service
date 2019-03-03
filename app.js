'use strict';
const path = require('path');
const config = require('./app.config');
const fastify = require('fastify')();
const prefix = '/api';

fastify
    .use(require('cors')())
    .register(require('./services/user'), { prefix })
    .register(require('fastify-static'), { root: path.join(__dirname, 'client') })
    .listen(config.PORT, config.URI, function (err) {
        if (err) throw err;
        console.log(`server listening on ${fastify.server.address().port}`)
    });