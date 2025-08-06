'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { build, setupTestDatabase, teardownTestDatabase } = require('../helper')
const { setupTestData, cleanupTestData } = require('../test-helpers')

test('Expenses E2E Tests', async (t) => {
  // Setup test database and run migrations
  await setupTestDatabase()
  
  const app = await build(t)
  
  // Setup test data before running tests
  const testData = await setupTestData(app)
  
  // Cleanup before app closes and after database teardown
  t.after(async () => {
    try {
      await cleanupTestData(app)
    } catch (error) {
      // Ignore cleanup errors during teardown
    }
    await teardownTestDatabase()
  })
  
  // Test data
  const validExpense = {
    name: 'Test Expense',
    amount: 100.50,
    categoryId: testData.categories[0].id, // Use actual category ID
    description: 'Test description'
  }

  const validExpenseWithoutOptional = {
    name: 'Minimal Expense',
    amount: 50.00,
    categoryId: testData.categories[0].id // Use actual category ID
  }

  const invalidExpense = {
    amount: 100.50,
    categoryId: testData.categories[0].id
    // missing required 'name' field
  }

  await t.test('GET /expenses - should return empty array initially', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses'
    })
    
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    const expenses = JSON.parse(res.payload)
    assert.ok(Array.isArray(expenses))
  })

  await t.test('POST /expenses - should create a new expense with all fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: validExpense
    })
    
    assert.strictEqual(res.statusCode, 201)
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    
    const expense = JSON.parse(res.payload)
    assert.ok(expense.id)
    assert.strictEqual(expense.name, validExpense.name)
    assert.strictEqual(expense.amount, validExpense.amount)
    assert.strictEqual(expense.categoryid, validExpense.categoryId)
    assert.strictEqual(expense.description, validExpense.description)
    assert.ok(expense.date)
    assert.ok(expense.created_at)
    assert.ok(expense.updated_at)
    
    // Store the ID for later tests
    t.expenseId = expense.id
  })

  await t.test('POST /expenses - should create expense with minimal required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: validExpenseWithoutOptional
    })
    
    assert.strictEqual(res.statusCode, 201)
    
    const expense = JSON.parse(res.payload)
    assert.ok(expense.id)
    assert.strictEqual(expense.name, validExpenseWithoutOptional.name)
    assert.strictEqual(expense.amount, validExpenseWithoutOptional.amount)
    assert.strictEqual(expense.categoryid, validExpenseWithoutOptional.categoryId)
    assert.strictEqual(expense.description, '') // should default to empty string
    assert.ok(expense.date) // should default to current date
    
    // Store the ID for later tests
    t.expenseId2 = expense.id
  })

  await t.test('POST /expenses - should return 400 for invalid expense data', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: invalidExpense
    })
    
    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('POST /expenses - should return 400 for non-existent category', async () => {
    const invalidExpenseWithCategory = {
      ...validExpense,
      categoryId: 99999 // Non-existent category ID
    }
    
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: invalidExpenseWithCategory
    })
    assert.strictEqual(res.statusCode, 400)
  });

  await t.test('POST /expenses - should return 400 for empty payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: {}
    })
    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('GET /expenses - should return all created expenses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses'
    })
    
    assert.strictEqual(res.statusCode, 200)
    
    const expenses = JSON.parse(res.payload)
    assert.ok(Array.isArray(expenses))
    assert.ok(expenses.length >= 2) // At least the two we created
    
    // Verify the expenses are ordered by date DESC
    if (expenses.length > 1) {
      for (let i = 0; i < expenses.length - 1; i++) {
        const currentDate = new Date(expenses[i].date)
        const nextDate = new Date(expenses[i + 1].date)
        assert.ok(currentDate >= nextDate, 'Expenses should be ordered by date DESC')
      }
    }
  })

  await t.test('GET /expenses/:id - should return specific expense', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/expenses/${t.expenseId}`
    })
    
    assert.strictEqual(res.statusCode, 200)
    
    const expense = JSON.parse(res.payload)
    assert.strictEqual(expense.id, t.expenseId)
    assert.strictEqual(expense.name, validExpense.name)
    assert.strictEqual(expense.amount, validExpense.amount)
    assert.strictEqual(expense.categoryid, validExpense.categoryId)
    assert.strictEqual(expense.description, validExpense.description)
  })

  await t.test('GET /expenses/:id - should return 404 for non-existent expense', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses/99999'
    })
    
    assert.strictEqual(res.statusCode, 404)
    
    const error = JSON.parse(res.payload)
    assert.strictEqual(error.error, 'Not Found')
  })

  await t.test('GET /expenses/:id - should return 400 for invalid ID format', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses/invalid-id'
    })
    
    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('PATCH /expenses/:id - should update existing expense', async () => {
    const updateData = {
      name: 'Updated Expense',
      amount: 200.75,
      categoryId: testData.categories[1].id, // Use different category
      description: 'Updated description',
      date: '2025-01-01'
    }
    
    const res = await app.inject({
      method: 'PATCH',
      url: `/expenses/${t.expenseId}`,
      payload: updateData
    })
    
    assert.strictEqual(res.statusCode, 200)
    
    const expense = JSON.parse(res.payload)
    assert.strictEqual(expense.id, t.expenseId)
    assert.strictEqual(expense.name, updateData.name)
    assert.strictEqual(expense.amount, updateData.amount)
    assert.strictEqual(expense.categoryid, updateData.categoryId)
    assert.strictEqual(expense.description, updateData.description)
    assert.strictEqual(expense.date, updateData.date)
  })

  await t.test('PATCH /expenses/:id - should update expense with partial data', async () => {
    const updateData = {
      name: 'Partially Updated Expense'
    }
    
    const res = await app.inject({
      method: 'PATCH',
      url: `/expenses/${t.expenseId2}`,
      payload: updateData
    })
    
    assert.strictEqual(res.statusCode, 200)
    
    const expense = JSON.parse(res.payload)
    assert.strictEqual(expense.id, t.expenseId2)
    assert.strictEqual(expense.name, updateData.name)
    // Other fields should remain unchanged
    assert.strictEqual(expense.amount, validExpenseWithoutOptional.amount)
    assert.strictEqual(expense.categoryid, validExpenseWithoutOptional.categoryId)
  })

  await t.test('PATCH /expenses/:id - should return 404 for non-existent expense', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/expenses/99999',
      payload: { name: 'Updated Name' }
    })
    
    assert.strictEqual(res.statusCode, 404)
    
    const error = JSON.parse(res.payload)
    assert.strictEqual(error.error, 'Not Found')
  })

  await t.test('PATCH /expenses/:id - should return 400 for invalid ID format', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/expenses/invalid-id',
      payload: { name: 'Updated Name' }
    })
    
    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('PATCH /expenses/:id - should return 400 for invalid category ID', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/expenses/${t.expenseId}`,
      payload: { categoryId: 99999 }
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('DELETE /expenses/:id - should delete existing expense', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/expenses/${t.expenseId2}`
    })
    
    assert.strictEqual(res.statusCode, 204)
    assert.strictEqual(res.payload, '')
    
    // Verify the expense is actually deleted
    const getRes = await app.inject({
      method: 'GET',
      url: `/expenses/${t.expenseId2}`
    })
    assert.strictEqual(getRes.statusCode, 404)
  })

  await t.test('DELETE /expenses/:id - should return 404 for non-existent expense', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/expenses/99999'
    })
    
    assert.strictEqual(res.statusCode, 404)
    
    const error = JSON.parse(res.payload)
    assert.strictEqual(error.error, 'Not Found')
  })

  await t.test('DELETE /expenses/:id - should return 400 for invalid ID format', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/expenses/invalid-id'
    })
    
    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('POST /expenses - should handle date field correctly', async () => {
    const expenseWithDate = {
      name: 'Date Test Expense',
      amount: 75.25,
      categoryId: testData.categories[0].id,
      date: '2025-06-15'
    }
    
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: expenseWithDate
    })
    
    assert.strictEqual(res.statusCode, 201)
    
    const expense = JSON.parse(res.payload)
    assert.strictEqual(expense.date, expenseWithDate.date)
    
    // Clean up
    await app.inject({
      method: 'DELETE',
      url: `/expenses/${expense.id}`
    })
  })

  await t.test('POST /expenses - should handle amount as string', async () => {
    const expenseWithStringAmount = {
      name: 'String Amount Expense',
      amount: '123.45', // amount as string
      categoryId: testData.categories[0].id
    }
    
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: expenseWithStringAmount
    })
    
    assert.strictEqual(res.statusCode, 201)
    
    const expense = JSON.parse(res.payload)
    assert.strictEqual(expense.amount, 123.45) // should be converted to number
    
    // Clean up
    await app.inject({
      method: 'DELETE',
      url: `/expenses/${expense.id}`
    })
  })

  await t.test('Response schema validation', async () => {
    // Create an expense to test response schema
    const res = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: validExpense
    })
    
    assert.strictEqual(res.statusCode, 201)
    
    const expense = JSON.parse(res.payload)
    
    // Verify all required fields are present
    assert.ok(typeof expense.id === 'number')
    assert.ok(typeof expense.name === 'string')
    assert.ok(typeof expense.amount === 'number')
    assert.ok(typeof expense.date === 'string')
    assert.ok(typeof expense.categoryid === 'number')
    assert.ok(typeof expense.description === 'string')
    assert.ok(typeof expense.created_at === 'string')
    assert.ok(typeof expense.updated_at === 'string')
    
    // Verify date formats
    assert.ok(!isNaN(Date.parse(expense.date)))
    assert.ok(!isNaN(Date.parse(expense.created_at)))
    assert.ok(!isNaN(Date.parse(expense.updated_at)))
    
    // Clean up
    await app.inject({
      method: 'DELETE',
      url: `/expenses/${expense.id}`
    })
  })

  // =====================================
  // Filtering Tests
  // =====================================

  // Create test expenses for filtering tests
  const filterTestExpenses = []
  
  // Create expenses for Food category
  const foodExpense1 = await app.inject({
    method: 'POST',
    url: '/expenses',
    payload: {
      name: 'Grocery Shopping',
      amount: 150.00,
      date: '2024-01-15',
      categoryId: testData.categories[0].id, // Food category
      description: 'Weekly groceries'
    }
  })
  filterTestExpenses.push(JSON.parse(foodExpense1.payload))

  const foodExpense2 = await app.inject({
    method: 'POST',
    url: '/expenses',
    payload: {
      name: 'Restaurant',
      amount: 75.50,
      date: '2024-01-20',
      categoryId: testData.categories[0].id, // Food category
      description: 'Dinner with friends'
    }
  })
  filterTestExpenses.push(JSON.parse(foodExpense2.payload))

  // Create expense for Transport category
  const transportExpense = await app.inject({
    method: 'POST',
    url: '/expenses',
    payload: {
      name: 'Gas',
      amount: 60.00,
      date: '2024-01-18',
      categoryId: testData.categories[1].id, // Transport category
      description: 'Car fuel'
    }
  })
  filterTestExpenses.push(JSON.parse(transportExpense.payload))

  // Create expense for Entertainment category
  const entertainmentExpense = await app.inject({
    method: 'POST',
    url: '/expenses',
    payload: {
      name: 'Movie tickets',
      amount: 25.00,
      date: '2024-02-05',
      categoryId: testData.categories[2].id, // Entertainment category
      description: 'Cinema'
    }
  })
  filterTestExpenses.push(JSON.parse(entertainmentExpense.payload))

  await t.test('GET /expenses - should filter by date range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?from=2024-01-01&to=2024-01-31'
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // Should only include January expenses (excluding February entertainment expense)
    const januaryExpenses = expenses.filter(expense => {
      const date = new Date(expense.date)
      return date >= new Date('2024-01-01') && date <= new Date('2024-01-31')
    })
    
    // All returned expenses should be within the date range
    assert.strictEqual(expenses.length, januaryExpenses.length)
    
    // Should include at least 3 expenses (groceries, restaurant, gas)
    assert.ok(expenses.length >= 3)
    
    // Should be ordered by date descending
    for (let i = 0; i < expenses.length - 1; i++) {
      const currentDate = new Date(expenses[i].date)
      const nextDate = new Date(expenses[i + 1].date)
      assert.ok(currentDate >= nextDate, 'Expenses should be ordered by date DESC')
    }
  })

  await t.test('GET /expenses - should filter by category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/expenses?categoryId=${testData.categories[0].id}` // Food category
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // All returned expenses should belong to Food category
    expenses.forEach(expense => {
      assert.strictEqual(expense.categoryid, testData.categories[0].id)
    })
    
    // Should include at least 2 food expenses (groceries, restaurant)
    assert.ok(expenses.length >= 2)
    
    // Should be ordered by date descending
    for (let i = 0; i < expenses.length - 1; i++) {
      const currentDate = new Date(expenses[i].date)
      const nextDate = new Date(expenses[i + 1].date)
      assert.ok(currentDate >= nextDate, 'Expenses should be ordered by date DESC')
    }
  })

  await t.test('GET /expenses - should filter by date range and category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/expenses?from=2024-01-01&to=2024-01-31&categoryId=${testData.categories[0].id}`
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // All returned expenses should be Food category in January
    expenses.forEach(expense => {
      assert.strictEqual(expense.categoryid, testData.categories[0].id)
      const date = new Date(expense.date)
      assert.ok(date >= new Date('2024-01-01') && date <= new Date('2024-01-31'))
    })
    
    // Should include 2 food expenses from January
    assert.strictEqual(expenses.length, 2)
    
    // Should be ordered by date descending
    for (let i = 0; i < expenses.length - 1; i++) {
      const currentDate = new Date(expenses[i].date)
      const nextDate = new Date(expenses[i + 1].date)
      assert.ok(currentDate >= nextDate, 'Expenses should be ordered by date DESC')
    }
  })

  await t.test('GET /expenses - should return empty for date range with no expenses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?from=2026-01-01&to=2026-01-31'
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // Should return empty array for future dates
    assert.strictEqual(expenses.length, 0)
  })

  await t.test('GET /expenses - should return empty for non-existent category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?categoryId=99999'
    })

    assert.strictEqual(res.statusCode, 400)
    const error = JSON.parse(res.payload)
  })

  await t.test('GET /expenses - should return 400 for invalid date format', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?from=invalid-date'
    })

    assert.strictEqual(res.statusCode, 400)
    const error = JSON.parse(res.payload)
  })

  await t.test('GET /expenses - should return 400 for invalid date range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?from=2024-12-31&to=2024-01-01'
    })

    assert.strictEqual(res.statusCode, 400)
    const error = JSON.parse(res.payload)
  })

  await t.test('GET /expenses - should return 400 for invalid categoryId', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?categoryId=invalid'
    })

    assert.strictEqual(res.statusCode, 400)
    const error = JSON.parse(res.payload)
  })

  await t.test('GET /expenses - should handle "to" date filter only', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?to=2024-01-31'
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // All returned expenses should be before or on 2024-01-31
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      assert.ok(date <= new Date('2024-01-31'))
    })
  })

  await t.test('GET /expenses - should handle "from" date filter only', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/expenses?from=2024-02-01'
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // All returned expenses should be on or after 2024-02-01
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      assert.ok(date >= new Date('2024-02-01'))
    })
  })

  await t.test('GET /expenses - should handle multiple filters with empty result', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/expenses?from=2024-03-01&to=2024-03-31&categoryId=${testData.categories[0].id}`
    })

    assert.strictEqual(res.statusCode, 200)
    const expenses = JSON.parse(res.payload)
    
    // Should return empty array since we have no March expenses
    assert.strictEqual(expenses.length, 0)
  })

  // Clean up filter test expenses
  for (const expense of filterTestExpenses) {
    await app.inject({
      method: 'DELETE',
      url: `/expenses/${expense.id}`
    })
  }
})
