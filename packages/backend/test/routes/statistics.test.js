'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { build, setupTestDatabase, teardownTestDatabase } = require('../helper')
const { setupTestData, cleanupTestData } = require('../test-helpers')

test('Statistics E2E Tests', async (t) => {
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
      console.error('Error during test cleanup:', error)
    }
    await teardownTestDatabase()
  })

  // Create some test expenses for statistics
  const testExpenses = []
  
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
  testExpenses.push(JSON.parse(foodExpense1.payload))

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
  testExpenses.push(JSON.parse(foodExpense2.payload))

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
  testExpenses.push(JSON.parse(transportExpense.payload))

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
  testExpenses.push(JSON.parse(entertainmentExpense.payload))

  await t.test('GET /statistics - should return overall statistics', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics'
    })

    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    
    const statistics = JSON.parse(res.payload)
    assert.ok(typeof statistics === 'object')
    assert.ok(typeof statistics.total === 'number')
    assert.ok(Array.isArray(statistics.categories))
    
    // Should have total of all expenses
    assert.strictEqual(statistics.total, 310.50)
    
    // Should have 3 categories with expenses
    assert.strictEqual(statistics.categories.length, 3)
    
    // Categories should be sorted by amount (descending)
    assert.ok(statistics.categories[0].amount >= statistics.categories[1].amount)
    assert.ok(statistics.categories[1].amount >= statistics.categories[2].amount)
    
    // Verify structure of category objects
    statistics.categories.forEach(category => {
      assert.ok(typeof category.categoryId === 'number')
      assert.ok(typeof category.categoryName === 'string')
      assert.ok(typeof category.amount === 'number')
    })
  })

  await t.test('GET /statistics - should filter by date range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics?from=2024-01-01&to=2024-01-31'
    })

    assert.strictEqual(res.statusCode, 200)
    const statistics = JSON.parse(res.payload)
    
    // Should only include January expenses (excluding February entertainment expense)
    assert.strictEqual(statistics.total, 285.50) // 150 + 75.50 + 60
    assert.strictEqual(statistics.categories.length, 2) // Only Food and Transport
  })

  await t.test('GET /statistics - should filter by category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/statistics?categoryId=${testData.categories[0].id}` // Food category
    })

    assert.strictEqual(res.statusCode, 200)
    const statistics = JSON.parse(res.payload)
    
    // Should only include Food category expenses
    assert.strictEqual(statistics.total, 225.50) // 150 + 75.50
    assert.strictEqual(statistics.categories.length, 1)
    assert.strictEqual(statistics.categories[0].categoryName, 'Food')
    assert.strictEqual(statistics.categories[0].amount, 225.50)
  })

  await t.test('GET /statistics - should filter by date range and category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/statistics?from=2024-01-01&to=2024-01-31&categoryId=${testData.categories[0].id}`
    })

    assert.strictEqual(res.statusCode, 200)
    const statistics = JSON.parse(res.payload)
    
    // Should only include January Food expenses
    assert.strictEqual(statistics.total, 225.50) // 150 + 75.50
    assert.strictEqual(statistics.categories.length, 1)
    assert.strictEqual(statistics.categories[0].categoryName, 'Food')
  })

  await t.test('GET /statistics - should return empty for date range with no expenses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics?from=2025-01-01&to=2025-01-31'
    })

    assert.strictEqual(res.statusCode, 200)
    const statistics = JSON.parse(res.payload)
    
    assert.strictEqual(statistics.total, 0)
    assert.strictEqual(statistics.categories.length, 0)
  })

  await t.test('GET /statistics - should return 400 for invalid date format', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics?from=invalid-date'
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('GET /statistics - should return 400 for invalid date range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics?from=2024-12-31&to=2024-01-01'
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('GET /statistics - should return 400 for invalid categoryId', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics?categoryId=invalid'
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('GET /statistics - should return 400 for non-existent categoryId', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics?categoryId=99999'
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('Response schema validation', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/statistics'
    })

    assert.strictEqual(res.statusCode, 200)
    const statistics = JSON.parse(res.payload)

    // Validate response structure matches schema
    assert.ok(typeof statistics === 'object')
    assert.ok(typeof statistics.total === 'number')
    assert.ok(Array.isArray(statistics.categories))

    statistics.categories.forEach(category => {
      assert.ok(typeof category.categoryId === 'number')
      assert.ok(typeof category.categoryName === 'string')
      assert.ok(typeof category.amount === 'number')
    })
  })
})
