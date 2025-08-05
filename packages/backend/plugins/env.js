'use strict'

const fp = require('fastify-plugin')
const fastifyEnv = require('@fastify/env')
const path = require('node:path')

const schema = {
  type: 'object',
  required: ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'],
  properties: {
    DB_HOST: { type: 'string', default: 'localhost' },
    DB_PORT: { type: 'number', default: 5432 },
    DB_USER: { type: 'string', default: 'user' },
    DB_PASSWORD: { type: 'string', default: 'password' },
    DB_NAME: { type: 'string', default: 'mydb' },
    APP_HOST: { type: 'string', default: 'http://localhost' },
  }
}

// Determine which .env file to load based on NODE_ENV
function getEnvFilePath() {
  const env = process.env.NODE_ENV
  if (env === 'test') {
    return path.join(__dirname, '..', '.env.test')
  }
  return path.join(__dirname, '..', '.env')
}

const options = {
  confKey: 'config',
  schema,
  dotenv: {
    path: getEnvFilePath()
  }
}

/**
 * This plugins adds environment variable support
 *
 * @see https://github.com/fastify/fastify-env
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(fastifyEnv, options).ready((err) => {
    if (err) console.error(err)
  })
}, { name: 'env' })
