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
   * Get all expenses ordered by date (newest first) with optional filtering
   * @param {Object} filters - Filter options
   * @param {string} filters.from - Start date (YYYY-MM-DD)
   * @param {string} filters.to - End date (YYYY-MM-DD)
   * @param {number} filters.categoryId - Category ID to filter by
   */
  async getAllExpenses(filters = {}) {
    const client = await this.fastify.pg.connect()
    try {
      const { from, to, categoryId } = filters
      
      // Build WHERE clause based on filters
      const conditions = []
      const params = []
      let paramIndex = 1

      if (from) {
        conditions.push(`date >= $${paramIndex}`)
        params.push(from)
        paramIndex++
      }

      if (to) {
        conditions.push(`date <= $${paramIndex}`)
        params.push(to)
        paramIndex++
      }

      if (categoryId) {
        conditions.push(`categoryid = $${paramIndex}`)
        params.push(categoryId)
        paramIndex++
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
      const query = `SELECT * FROM expenses ${whereClause} ORDER BY date DESC`

      const { rows } = await client.query(query, params)
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

  /**
   * Validate query parameters for filtering expenses
   * @param {Object} query - Query parameters
   * @returns {Object} Validation result
   */
  async validateQuery(query) {
    const { from, to, categoryId } = query

    // Validate date format if provided
    if (from && !this.isValidDate(from)) {
      return { valid: false, error: 'Invalid "from" date format. Use YYYY-MM-DD.' }
    }

    if (to && !this.isValidDate(to)) {
      return { valid: false, error: 'Invalid "to" date format. Use YYYY-MM-DD.' }
    }

    // Validate date range
    if (from && to && new Date(from) > new Date(to)) {
      return { valid: false, error: '"from" date cannot be later than "to" date.' }
    }

    // Validate categoryId if provided
    if (categoryId) {
      const categoryIdNumber = parseInt(categoryId, 10)
      if (isNaN(categoryIdNumber) || categoryIdNumber <= 0) {
        return { valid: false, error: 'Invalid categoryId. Must be a positive integer.' }
      }

      // Check if category exists
      const client = await this.fastify.pg.connect()
      try {
        const { rows } = await client.query(
          'SELECT 1 FROM categories WHERE id = $1',
          [categoryIdNumber]
        )

        if (rows.length === 0) {
          return { valid: false, error: 'Category with given ID does not exist.' }
        }
      } finally {
        client.release()
      }
    }

    return { valid: true }
  }

  /**
   * Check if a string is a valid date in YYYY-MM-DD format
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid date
   */
  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) {
      return false
    }
    
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]
  }
}

module.exports = ExpenseService
