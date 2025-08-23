'use strict'

const fp = require('fastify-plugin')
const ws = require('@fastify/websocket')

/**
 * This plugins adds WebSocket support to the application
 *
 * @see https://github.com/fastify/fastify-websocket
 */ 
module.exports = fp(async function (fastify) {
  fastify.register(ws)
}, { dependencies: ['env'], name: 'ws' })
