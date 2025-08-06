'use strict'

// Common expense object schema
const expenseObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    amount: { type: 'number' },
    date: { type: 'string', format: 'date' },
    category: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    },
    description: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

// Common error response schema
const errorResponse = {
  type: 'object',
  properties: {
    error: { type: 'string' }
  }
}

// ID parameter schema
const idParam = {
  type: 'object',
  properties: {
    id: { type: 'integer' }
  }
}

// Create expense request body schema
const createExpenseBody = {
  type: 'object',
  required: ['name', 'amount', 'categoryId'],
  properties: {
    name: { type: 'string' },
    amount: { type: 'number' },
    date: { type: 'string', format: 'date' },
    categoryId: { type: 'integer' },
    description: { type: 'string' }
  }
}

// Update expense request body schema
const updateExpenseBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    amount: { type: 'number' },
    date: { type: 'string', format: 'date' },
    categoryId: { type: 'integer' },
    description: { type: 'string' }
  }
}

// Query parameters schema for filtering expenses
const expenseQuerystring = {
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
      description: 'Category ID to filter expenses'
    }
  },
  additionalProperties: false
}

module.exports = {
  // Route schemas
  getAllExpenses: {
    querystring: expenseQuerystring,
    response: {
      200: {
        type: 'array',
        items: expenseObject
      },
      400: errorResponse
    }
  },

  createExpense: {
    body: createExpenseBody,
    response: {
      201: expenseObject
    }
  },

  getExpenseById: {
    params: idParam,
    response: {
      200: expenseObject,
      404: errorResponse
    }
  },

  updateExpense: {
    params: idParam,
    body: updateExpenseBody,
    response: {
      200: expenseObject,
      404: errorResponse
    }
  },

  deleteExpense: {
    params: idParam,
    response: {
      204: { type: 'null' },
      404: errorResponse
    }
  }
}
