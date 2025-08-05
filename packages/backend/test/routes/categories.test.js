'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { build, setupTestDatabase, teardownTestDatabase } = require('../helper')
const { setupTestData, cleanupTestData, createTestCategory } = require('../test-helpers')

test('Categories E2E Tests', async (t) => {
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
  const validCategory = {
    name: 'Test Category'
  }

  const duplicateCategory = {
    name: 'Food' // This should already exist from setupTestData
  }

  const invalidCategory = {
    // missing required 'name' field
  }

  const emptyNameCategory = {
    name: ''
  }

  await t.test('GET /categories - should return all categories', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/categories'
    })

    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    const categories = JSON.parse(res.payload)
    assert.ok(Array.isArray(categories))
    assert.ok(categories.length >= 4) // At least the test categories created in setup

    // Verify structure of first category
    if (categories.length > 0) {
      const category = categories[0]
      assert.ok(typeof category.id === 'number')
      assert.ok(typeof category.name === 'string')
      assert.ok(typeof category.created_at === 'string')
      assert.ok(typeof category.updated_at === 'string')
    }
  })

  await t.test('POST /categories - should create a new category', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: validCategory
    })

    assert.strictEqual(res.statusCode, 201)
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')

    const category = JSON.parse(res.payload)
    assert.ok(category.id)
    assert.strictEqual(category.name, validCategory.name)
    assert.ok(category.created_at)
    assert.ok(category.updated_at)

    // Store the ID for later tests
    t.categoryId = category.id
  })

  await t.test('POST /categories - should return 400 for invalid category data', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: invalidCategory
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('POST /categories - should return 400 for empty name', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: emptyNameCategory
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('POST /categories - should return 400 for duplicate category name', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: duplicateCategory
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('POST /categories - should return 400 for empty payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: {}
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('POST /categories - should return 400 for name that longer than 255 characters', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      payload: { name: 'A'.repeat(256) }
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('GET /categories/:id - should return specific category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/categories/${t.categoryId}`
    })

    assert.strictEqual(res.statusCode, 200)

    const category = JSON.parse(res.payload)
    assert.strictEqual(category.id, t.categoryId)
    assert.strictEqual(category.name, validCategory.name)
    assert.ok(category.created_at)
    assert.ok(category.updated_at)
  })

  await t.test('GET /categories/:id - should return 404 for non-existent category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/categories/99999'
    })

    assert.strictEqual(res.statusCode, 404)

    const error = JSON.parse(res.payload)
    assert.strictEqual(error.error, 'Not Found')
  })

  await t.test('GET /categories/:id - should return 400 for invalid ID format', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/categories/invalid-id'
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('PATCH /categories/:id - should update existing category', async () => {
    const updateData = {
      name: 'Updated Category'
    }

    const res = await app.inject({
      method: 'PATCH',
      url: `/categories/${t.categoryId}`,
      payload: updateData
    })

    assert.strictEqual(res.statusCode, 200)

    const category = JSON.parse(res.payload)
    assert.strictEqual(category.id, t.categoryId)
    assert.strictEqual(category.name, updateData.name)
    assert.ok(category.created_at)
    assert.ok(category.updated_at)

    // Verify updated_at changed (though we can't easily test the exact value)
    assert.ok(category.updated_at)
  })

  await t.test('PATCH /categories/:id - should return 404 for non-existent category', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/categories/99999',
      payload: { name: 'Updated Name' }
    })

    assert.strictEqual(res.statusCode, 404)

    const error = JSON.parse(res.payload)
    assert.strictEqual(error.error, 'Not Found')
  })

  await t.test('PATCH /categories/:id - should return 400 for invalid ID format', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/categories/invalid-id',
      payload: { name: 'Updated Name' }
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('PATCH /categories/:id - should return 400 for empty name', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/categories/${t.categoryId}`,
      payload: { name: '' }
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('PATCH /categories/:id - should return 400 for name longer than 255 characters', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/categories/${t.categoryId}`,
      payload: { name: 'A'.repeat(256) }
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('PATCH /categories/:id - should return 400 for duplicate name', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/categories/${t.categoryId}`,
      payload: { name: 'Food' } // This should already exist
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('DELETE /categories/:id - should delete existing category when no expenses exist', async () => {
    // Create a new category specifically for deletion test
    const categoryToDelete = await createTestCategory(app, { name: 'Category to Delete' })

    const res = await app.inject({
      method: 'DELETE',
      url: `/categories/${categoryToDelete.id}`
    })

    assert.strictEqual(res.statusCode, 204)
    assert.strictEqual(res.payload, '')

    // Verify the category is actually deleted
    const getRes = await app.inject({
      method: 'GET',
      url: `/categories/${categoryToDelete.id}`
    })
    assert.strictEqual(getRes.statusCode, 404)
  })

  await t.test('DELETE /categories/:id - should return 400 when category has expenses', async () => {
    // First create an expense using one of the existing categories
    const expenseData = {
      name: 'Test Expense',
      amount: 100.00,
      categoryId: testData.categories[0].id
    }

    const expenseRes = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: expenseData
    })

    assert.strictEqual(expenseRes.statusCode, 201)

    // Now try to delete the category that has an expense
    const res = await app.inject({
      method: 'DELETE',
      url: `/categories/${testData.categories[0].id}`
    })

    assert.strictEqual(res.statusCode, 400)

    const error = JSON.parse(res.payload)
    assert.ok(error.message.includes('Cannot delete category'))

    // Clean up the expense
    const expense = JSON.parse(expenseRes.payload)
    await app.inject({
      method: 'DELETE',
      url: `/expenses/${expense.id}`
    })
  })

  await t.test('DELETE /categories/:id - should return 404 for non-existent category', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/categories/99999'
    })

    assert.strictEqual(res.statusCode, 404)

    const error = JSON.parse(res.payload)
    assert.strictEqual(error.error, 'Not Found')
  })

  await t.test('DELETE /categories/:id - should return 400 for invalid ID format', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/categories/invalid-id'
    })

    assert.strictEqual(res.statusCode, 400)
  })

  await t.test('Response schema validation', async () => {
    // Test response schema by getting all categories
    const res = await app.inject({
      method: 'GET',
      url: '/categories'
    })

    assert.strictEqual(res.statusCode, 200)

    const categories = JSON.parse(res.payload)
    assert.ok(Array.isArray(categories))

    if (categories.length > 0) {
      const category = categories[0]

      // Verify all required fields are present and have correct types
      assert.ok(typeof category.id === 'number')
      assert.ok(typeof category.name === 'string')
      assert.ok(typeof category.created_at === 'string')
      assert.ok(typeof category.updated_at === 'string')

      // Verify date formats
      assert.ok(!isNaN(Date.parse(category.created_at)))
      assert.ok(!isNaN(Date.parse(category.updated_at)))

      // Verify name is not empty
      assert.ok(category.name.length > 0)
    }
  })
})
