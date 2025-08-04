'use strict'

// Common category object schema
const categoryObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
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

// Create category request body schema
const createCategoryBody = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 }
  }
}

// Update category request body schema
const updateCategoryBody = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 }
  }
}

module.exports = {
  // Route schemas
  getAllCategories: {
    response: {
      200: {
        type: 'array',
        items: categoryObject
      }
    }
  },

  createCategory: {
    body: createCategoryBody,
    response: {
      201: categoryObject
    }
  },

  getCategoryById: {
    params: idParam,
    response: {
      200: categoryObject,
      404: errorResponse
    }
  },

  updateCategory: {
    params: idParam,
    body: updateCategoryBody,
    response: {
      200: categoryObject,
      404: errorResponse
    }
  },

  deleteCategory: {
    params: idParam,
    response: {
      204: { type: 'null' },
      404: errorResponse
    }
  }
}
