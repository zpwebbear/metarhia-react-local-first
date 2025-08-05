'use strict'

const StatisticsService = require('../../services/statistics-service')
const schemas = require('../../schemas/statistics-schemas')

module.exports = async function (fastify, opts) {
  // Initialize statistics service
  const statisticsService = new StatisticsService(fastify)

  // =====================================
  // GET /statistics - Get expense statistics
  // =====================================
  fastify.get('/', {
    schema: schemas.getStatistics
  }, async (request, reply) => {
    try {
      // Validate query parameters
      const isValid = await statisticsService.validateQuery(request.query)
      if (!isValid.valid) {
        return reply.badRequest(isValid.error)
      }

      // Parse and prepare filters
      const filters = {}
      
      if (request.query.from) {
        filters.from = request.query.from
      }
      
      if (request.query.to) {
        filters.to = request.query.to
      }
      
      if (request.query.categoryId) {
        filters.categoryId = parseInt(request.query.categoryId, 10)
      }

      // Get statistics
      const statistics = await statisticsService.getStatistics(filters)
      return statistics
    } catch (error) {
      request.log.error({ error, context: 'getStatistics' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })
}
