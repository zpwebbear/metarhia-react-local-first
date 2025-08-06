'use strict'

const ExpenseService = require('../../services/expense-service')
const schemas = require('../../schemas/expense-schemas')

module.exports = async function (fastify, opts) {
  // Initialize expense service
  const expenseService = new ExpenseService(fastify)

  // =====================================
  // GET /expenses - Get all expenses
  // =====================================
  fastify.get('/', {
    schema: schemas.getAllExpenses
  }, async (request, reply) => {
    try {
      // Validate query parameters
      const isValid = await expenseService.validateQuery(request.query)
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

      const expenses = await expenseService.getAllExpenses(filters)
      return expenses
    } catch (error) {
      request.log.error({ error, context: 'getAllExpenses' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // POST /expenses - Create a new expense
  // =====================================
  fastify.post('/', {
    schema: schemas.createExpense
  }, async (request, reply) => {
    try {
      const isValid = await expenseService.validatePayload(request.body)
      if (!isValid.valid) {
        return reply.badRequest(isValid.error)
      }
      const expense = await expenseService.createExpense(request.body)
      reply.code(201)
      return expense
    } catch (error) {
      request.log.error({ error, context: 'createExpense' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // GET /expenses/:id - Get expense by ID
  // =====================================
  fastify.get('/:id', {
    schema: schemas.getExpenseById
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const expense = await expenseService.getExpenseById(id)
      
      if (!expense) {
        return reply.notFound('Expense not found')
      }
      
      return expense
    } catch (error) {
      request.log.error({ error, context: 'getExpenseById' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // PATCH /expenses/:id - Update expense
  // =====================================
  fastify.patch('/:id', {
    schema: schemas.updateExpense
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const isValid = await expenseService.validatePayload(request.body)
      if (!isValid.valid) {
        return reply.badRequest(isValid.error)
      }
      const expense = await expenseService.updateExpense(id, request.body)
      
      if (!expense) {
        return reply.notFound('Expense not found')
      }
      
      return expense
    } catch (error) {
      request.log.error({ error, context: 'updateExpense' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })

  // =====================================
  // DELETE /expenses/:id - Delete expense
  // =====================================
  fastify.delete('/:id', {
    schema: schemas.deleteExpense
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const deleted = await expenseService.deleteExpense(id)
      
      if (!deleted) {
        return reply.notFound('Expense not found')
      }
      
      reply.code(204)
      return
    } catch (error) {
      request.log.error({ error, context: 'deleteExpense' }, 'Route error occurred')
      return reply.internalServerError('Internal Server Error')
    }
  })
}