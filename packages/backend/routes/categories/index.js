'use strict'

const CategoryService = require('../../services/category-service')
const schemas = require('../../schemas/category-schemas')

module.exports = async function (fastify, opts) {
  // Initialize category service
  const categoryService = new CategoryService(fastify)

  // =====================================
  // GET /categories - Get all categories
  // =====================================
  fastify.get('/', {
    schema: schemas.getAllCategories
  }, async (request, reply) => {
    try {
      const categories = await categoryService.getAllCategories()
      return categories
    } catch (error) {
      request.log.error({ error, context: 'getAllCategories' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // POST /categories - Create a new category
  // =====================================
  fastify.post('/', {
    schema: schemas.createCategory
  }, async (request, reply) => {
    try {
      const isValid = await categoryService.validatePayload(request.body)
      if (!isValid.valid) {
        return reply.badRequest(isValid.error)
      }
      const category = await categoryService.createCategory(request.body)
      reply.code(201);
      return category;
    } catch (error) {
      request.log.error({ error, context: 'createCategory' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // GET /categories/:id - Get category by ID
  // =====================================
  fastify.get('/:id', {
    schema: schemas.getCategoryById
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const category = await categoryService.getCategoryById(id)
      
      if (!category) {
        return reply.notFound('Category not found')
      }
      
      return category
    } catch (error) {
      request.log.error({ error, context: 'getCategoryById' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // PATCH /categories/:id - Update category
  // =====================================
  fastify.patch('/:id', {
    schema: schemas.updateCategory
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const isValid = await categoryService.validatePayload(request.body)
      if (!isValid.valid) {
        return reply.badRequest(isValid.error)
      }
      const category = await categoryService.updateCategory(id, request.body)
      
      if (!category) {
        return reply.notFound('Category not found')
      }
      
      return category
    } catch (error) {
      request.log.error({ error, context: 'updateCategory' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // DELETE /categories/:id - Delete category
  // =====================================
  fastify.delete('/:id', {
    schema: schemas.deleteCategory
  }, async (request, reply) => {
    try {
      const { id } = request.params
      
      try {
        const deleted = await categoryService.deleteCategory(id)
        
        if (!deleted) {
          return reply.notFound('Category not found')
        }
        
        reply.code(204);
        return;
      } catch (error) {
        // Handle business logic errors (like foreign key constraints)
        if (error.message.includes('Cannot delete category')) {
          return reply.badRequest(error.message)
        }
        throw error; // Re-throw other errors to be handled by outer catch
      }
    } catch (error) {
      request.log.error({ error, context: 'deleteCategory' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })
}
