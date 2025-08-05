'use strict'

const fp = require('fastify-plugin')
const cors = require('@fastify/cors')

/**
 * This plugins adds CORS support to the application
 *
 * @see https://github.com/fastify/fastify-cors
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(cors, {
    origin: fastify.config.APP_HOST,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}, { dependencies: ['env'] })
