'use strict'

const CategoryService = require('../../services/category-service')
const schemas = require('../../schemas/category-schemas')
const { asyncHandler, handleNotFound } = require('../../utils/error-handler')

module.exports = async function (fastify, opts) {
  // Initialize category service
  const categoryService = new CategoryService(fastify)

  // =====================================
  // GET /categories - Get all categories
  // =====================================
  fastify.get('/', {
    schema: schemas.getAllCategories
  }, asyncHandler(async function getAllCategories(request, reply) {
    const categories = await categoryService.getAllCategories()
    return categories
  }))

  // =====================================
  // POST /categories - Create a new category
  // =====================================
  fastify.post('/', {
    schema: schemas.createCategory
  }, asyncHandler(async function createCategory(request, reply) {
    const isValid = await categoryService.validatePayload(request.body)
    if (!isValid.valid) {
      return reply.badRequest(isValid.error)
    }
    const category = await categoryService.createCategory(request.body)
    reply.code(201);
    return category;
  }))

  // =====================================
  // GET /categories/:id - Get category by ID
  // =====================================
  fastify.get('/:id', {
    schema: schemas.getCategoryById
  }, asyncHandler(async function getCategoryById(request, reply) {
    const { id } = request.params
    const category = await categoryService.getCategoryById(id)
    
    if (!category) {
      return handleNotFound(reply, 'Category')
    }
    
    return category
  }))

  // =====================================
  // PATCH /categories/:id - Update category
  // =====================================
  fastify.patch('/:id', {
    schema: schemas.updateCategory
  }, asyncHandler(async function updateCategory(request, reply) {
    const { id } = request.params
    const isValid = await categoryService.validatePayload(request.body)
    if (!isValid.valid) {
      return reply.badRequest(isValid.error)
    }
    const category = await categoryService.updateCategory(id, request.body)
    
    if (!category) {
      return handleNotFound(reply, 'Category')
    }
    
    return category
  }))

  // =====================================
  // DELETE /categories/:id - Delete category
  // =====================================
  fastify.delete('/:id', {
    schema: schemas.deleteCategory
  }, asyncHandler(async function deleteCategory(request, reply) {
    const { id } = request.params
    
    try {
      const deleted = await categoryService.deleteCategory(id)
      
      if (!deleted) {
        return handleNotFound(reply, 'Category')
      }
      
      reply.code(204);
      return;
    } catch (error) {
      // Handle business logic errors (like foreign key constraints)
      if (error.message.includes('Cannot delete category')) {
        return reply.badRequest(error.message)
      }
      throw error; // Re-throw other errors to be handled by asyncHandler
    }
  }))
}
