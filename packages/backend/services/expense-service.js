'use strict'

class ExpenseService {
  constructor(fastify) {
    this.fastify = fastify
  }

  async validatePayload(payload) {
    const { categoryId } = payload;
    if (!categoryId) return { valid: true }
    const client = await this.fastify.pg.connect()
    try {
      // Check that categoryId exists
      const categoryExists = await client.query(
        'SELECT 1 FROM categories WHERE id = $1',
        [categoryId]
      )

      if (!categoryExists.rows.length) {
        return { valid: false, error: "Category with given ID does not exist" }
      }

      return { valid: true }
    } finally {
      client.release()
    }
  }

  /**
   * Get all expenses ordered by date (newest first)
   */
  async getAllExpenses() {
    const client = await this.fastify.pg.connect()
    try {
      const { rows } = await client.query(
        'SELECT * FROM expenses ORDER BY date DESC'
      )
      return rows
    } finally {
      client.release()
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData) {
    const client = await this.fastify.pg.connect()
    try {
      const {
        name,
        amount,
        date = new Date().toISOString().split('T')[0],
        categoryId,
        description = ''
      } = expenseData

      const { rows } = await client.query(
        'INSERT INTO expenses (name, amount, date, categoryId, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, amount, date, categoryId, description]
      )

      return rows[0]
    } finally {
      client.release()
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id) {
    const client = await this.fastify.pg.connect()
    try {
      const { rows } = await client.query(
        'SELECT * FROM expenses WHERE id = $1',
        [id]
      )

      return rows.length > 0 ? rows[0] : null
    } finally {
      client.release()
    }
  }

  /**
   * Update expense by ID
   */
  async updateExpense(id, updates) {
    const client = await this.fastify.pg.connect()
    try {
      // Check if expense exists
      const existing = await this.getExpenseById(id)
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

      const updateQuery = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
      values.push(id)

      const { rows } = await client.query(updateQuery, values)
      return rows[0]
    } finally {
      client.release()
    }
  }

  /**
   * Delete expense by ID
   */
  async deleteExpense(id) {
    const client = await this.fastify.pg.connect()
    try {
      const { rowCount } = await client.query(
        'DELETE FROM expenses WHERE id = $1',
        [id]
      )

      return rowCount > 0
    } finally {
      client.release()
    }
  }
}

module.exports = ExpenseService
