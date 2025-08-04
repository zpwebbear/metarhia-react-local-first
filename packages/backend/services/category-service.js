'use strict'

class CategoryService {
  constructor(fastify) {
    this.fastify = fastify
  }

  async validatePayload(payload) {
    const { name } = payload
    const client = await this.fastify.pg.connect()
    try {
      // Check if category name already exists
      const { rows } = await client.query(
        'SELECT COUNT(*) FROM categories WHERE name = $1',
        [name]
      )
      const count = parseInt(rows[0].count, 10)
      if (count > 0) {
        return { valid: false, error: 'Category name already exists' }
      }
      return { valid: true }
    } finally {
      client.release()
    }
  }

  /**
   * Get all categories ordered by name
   */
  async getAllCategories() {
    const client = await this.fastify.pg.connect()
    try {
      const { rows } = await client.query(
        'SELECT * FROM categories ORDER BY name ASC'
      )
      return rows
    } finally {
      client.release()
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    const client = await this.fastify.pg.connect()
    try {
      const { name } = categoryData

      const { rows } = await client.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
      )

      return rows[0]
    } finally {
      client.release()
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    const client = await this.fastify.pg.connect()
    try {
      const { rows } = await client.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      )

      return rows.length > 0 ? rows[0] : null
    } finally {
      client.release()
    }
  }

  /**
   * Update category by ID
   */
  async updateCategory(id, updates) {
    const client = await this.fastify.pg.connect()
    try {
      // Check if category exists
      const existing = await this.getCategoryById(id)
      if (!existing) {
        return null
      }

      // Build dynamic update query
      const fields = []
      const values = []
      let paramIndex = 1

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramIndex}`)
          values.push(updates[key])
          paramIndex++
        }
      })

      // Add updated_at timestamp
      fields.push(`updated_at = NOW()`)

      const updateQuery = `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
      values.push(id)

      const { rows } = await client.query(updateQuery, values)
      return rows[0]
    } finally {
      client.release()
    }
  }

  /**
   * Delete category by ID
   */
  async deleteCategory(id) {
    const client = await this.fastify.pg.connect()
    try {
      // Check if there are any expenses using this category
      const expensesCheck = await client.query(
        'SELECT COUNT(*) FROM expenses WHERE categoryId = $1',
        [id]
      )

      const expenseCount = parseInt(expensesCheck.rows[0].count)
      if (expenseCount > 0) {
        throw new Error(`Cannot delete category. There are ${expenseCount} expense(s) using this category.`)
      }

      const { rowCount } = await client.query(
        'DELETE FROM categories WHERE id = $1',
        [id]
      )

      return rowCount > 0
    } finally {
      client.release()
    }
  }
}

module.exports = CategoryService
