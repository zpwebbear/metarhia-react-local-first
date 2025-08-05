'use strict'

class StatisticsService {
  constructor(fastify) {
    this.fastify = fastify
  }

  /**
   * Get expense statistics grouped by categories
   * @param {Object} filters - Filter options
   * @param {string} filters.from - Start date (YYYY-MM-DD)
   * @param {string} filters.to - End date (YYYY-MM-DD)
   * @param {number} filters.categoryId - Category ID to filter by
   * @returns {Object} Statistics with total and categories breakdown
   */
  async getStatistics(filters = {}) {
    const client = await this.fastify.pg.connect()
    try {
      const { from, to, categoryId } = filters
      
      // Build WHERE clause based on filters
      const conditions = []
      const params = []
      let paramIndex = 1

      if (from) {
        conditions.push(`e.date >= $${paramIndex}`)
        params.push(from)
        paramIndex++
      }

      if (to) {
        conditions.push(`e.date <= $${paramIndex}`)
        params.push(to)
        paramIndex++
      }

      if (categoryId) {
        conditions.push(`e.categoryid = $${paramIndex}`)
        params.push(categoryId)
        paramIndex++
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Query to get statistics grouped by category
      const query = `
        SELECT 
          c.id as "categoryId",
          c.name as "categoryName",
          COALESCE(SUM(e.amount), 0) as amount
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.categoryid ${whereClause ? `AND ${conditions.join(' AND ')}` : ''}
        GROUP BY c.id, c.name
        HAVING COALESCE(SUM(e.amount), 0) > 0
        ORDER BY amount DESC
      `

      const { rows } = await client.query(query, params)

      // Calculate total
      const total = rows.reduce((sum, row) => sum + parseFloat(row.amount), 0)

      // Format the response
      const categories = rows.map(row => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        amount: parseFloat(row.amount)
      }))

      return {
        total,
        categories
      }
    } finally {
      client.release()
    }
  }

  /**
   * Validate query parameters for statistics endpoint
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
    return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0]
  }
}

module.exports = StatisticsService
