'use strict'

const ExpenseService = require('../../services/expense-service')
const schemas = require('../../schemas/expense-schemas')
const { asyncHandler, handleNotFound } = require('../../utils/error-handler')

module.exports = async function (fastify, opts) {
  // Initialize expense service
  const expenseService = new ExpenseService(fastify)

  // =====================================
  // GET /expenses - Get all expenses
  // =====================================
  fastify.get('/', {
    schema: schemas.getAllExpenses
  }, asyncHandler(async function getAllExpenses(request, reply) {
    const expenses = await expenseService.getAllExpenses()
    return expenses
  }))

  // =====================================
  // POST /expenses - Create a new expense
  // =====================================
  fastify.post('/', {
    schema: schemas.createExpense
  }, asyncHandler(async function createExpense(request, reply) {
    const isValid = await expenseService.validatePayload(request.body)
    if(!isValid.valid) {
      return reply.badRequest(isValid.error)
    }
    const expense = await expenseService.createExpense(request.body)
    reply.code(201);
    return expense;
  }))

  // =====================================
  // GET /expenses/:id - Get expense by ID
  // =====================================
  fastify.get('/:id', {
    schema: schemas.getExpenseById
  }, asyncHandler(async function getExpenseById(request, reply) {
    const { id } = request.params
    const expense = await expenseService.getExpenseById(id)
    
    if (!expense) {
      return handleNotFound(reply, 'Expense')
    }
    
    return expense
  }))

  // =====================================
  // PATCH /expenses/:id - Update expense
  // =====================================
  fastify.patch('/:id', {
    schema: schemas.updateExpense
  }, asyncHandler(async function updateExpense(request, reply) {
    const { id } = request.params
    const isValid = await expenseService.validatePayload(request.body)
    if(!isValid.valid) {
      return reply.badRequest(isValid.error)
    }
    const expense = await expenseService.updateExpense(id, request.body)
    
    if (!expense) {
      return handleNotFound(reply, 'Expense')
    }
    
    return expense
  }))

  // =====================================
  // DELETE /expenses/:id - Delete expense
  // =====================================
  fastify.delete('/:id', {
    schema: schemas.deleteExpense
  }, asyncHandler(async function deleteExpense(request, reply) {
    const { id } = request.params
    const deleted = await expenseService.deleteExpense(id)
    
    if (!deleted) {
      return handleNotFound(reply, 'Expense')
    }
    
    reply.code(204);
    return;
  }))
}