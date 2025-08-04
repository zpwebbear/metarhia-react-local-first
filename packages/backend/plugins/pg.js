'use strict'

const fp = require('fastify-plugin')
const fastifyPostgres = require('@fastify/postgres')

/**
 * This plugins adds PostgreSQL support
 *
 * @see https://github.com/fastify/fastify-postgres
 */
module.exports = fp(async function (fastify) {
  const config = fastify.config;
  const connectionString = `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`;
  fastify.register(fastifyPostgres, {
    connectionString
  })
}, { name: 'pg', dependencies: ['env'] })
