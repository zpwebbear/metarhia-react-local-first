'use strict'

// Statistics response schema
const statisticsObject = {
  type: 'object',
  properties: {
    total: { type: 'number' },
    categories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          categoryId: { type: 'integer' },
          categoryName: { type: 'string' },
          amount: { type: 'number' },
        }
      }
    }
  }
}

// Common error response schema
const errorResponse = {
  type: 'object',
  properties: {
    error: { type: 'string' }
  }
}

// Query parameters schema for statistics
const statisticsQuerystring = {
  type: 'object',
  properties: {
    from: { 
      type: 'string', 
      format: 'date',
      description: 'Start date for filtering expenses (YYYY-MM-DD)'
    },
    to: { 
      type: 'string', 
      format: 'date',
      description: 'End date for filtering expenses (YYYY-MM-DD)'
    },
    categoryId: { 
      type: 'integer',
      minimum: 1,
      description: 'Category ID to filter statistics'
    }
  },
  additionalProperties: false
}

module.exports = {
  // Route schemas
  getStatistics: {
    querystring: statisticsQuerystring,
    response: {
      200: statisticsObject,
      400: errorResponse
    }
  }
}
