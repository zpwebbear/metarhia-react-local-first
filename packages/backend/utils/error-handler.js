'use strict'

/**
 * Common error handler for API routes
 */
function handleError(request, reply, error, context = '') {
  request.log.error({ error, context }, 'Route error occurred')
  
  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  const errorMessage = isDevelopment ? error.message : 'Internal Server Error'
  
  reply.code(500).send({ error: errorMessage })
}

/**
 * Handle not found errors with consistent format
 */
function handleNotFound(reply, resource = 'Resource') {
  reply.code(404).send({ error: `${resource} not found` })
}

/**
 * Async route wrapper that handles errors automatically
 */
function asyncHandler(handler) {
  return async function(request, reply) {
    try {
      return await handler(request, reply)
    } catch (error) {
      handleError(request, reply, error, handler.name || 'unknown handler')
    }
  }
}

module.exports = {
  handleError,
  handleNotFound,
  asyncHandler
}
