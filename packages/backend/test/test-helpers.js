'use strict'

/**
 * Test Database Setup Helper
 * This module provides utilities for setting up test data
 */

async function setupTestData(app) {
  // Create some test categories
  const testCategories = [
    { name: 'Food' },
    { name: 'Transport' },
    { name: 'Entertainment' },
    { name: 'Utilities' }
  ]

  const createdCategories = []

  for (const category of testCategories) {
    try {
      const client = await app.pg.connect()
      const { rows } = await client.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [category.name]
      )
      client.release()
      createdCategories.push(rows[0])
    } catch (error) {
      console.error('Error creating test category:', error)
    }
  }

  return {
    categories: createdCategories
  }
}

async function cleanupTestData(app) {
  try {
    // Check if the app is still open before trying to clean up
    if (app.hasReplyDecorator && app.pg) {
      const client = await app.pg.connect()
      
      // Delete all expenses first (due to foreign key constraint)
      await client.query('DELETE FROM expenses')
      
      // Then delete all categories
      await client.query('DELETE FROM categories')
      
      client.release()
    }
  } catch (error) {
    // Only log if it's not a pool closed error
    if (!error.message.includes('after calling end on the pool')) {
      console.error('Error cleaning up test data:', error)
    }
  }
}

async function createTestExpense(app, expenseData, categoryId = 1) {
  const client = await app.pg.connect()
  
  const { name, amount, date = new Date().toISOString().split('T')[0], description = '' } = expenseData
  
  const { rows } = await client.query(
    'INSERT INTO expenses (name, amount, date, categoryId, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, amount, date, categoryId, description]
  )
  
  client.release()
  return rows[0]
}

async function createTestCategory(app, categoryData) {
  const client = await app.pg.connect()
  
  const { rows } = await client.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING *',
    [categoryData.name]
  )
  
  client.release()
  return rows[0]
}

module.exports = {
  setupTestData,
  cleanupTestData,
  createTestExpense,
  createTestCategory
}
