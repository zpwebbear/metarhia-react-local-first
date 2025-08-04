'use strict'

module.exports = async function (fastify, opts) {
  // GET /expenses - Get all expenses
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              amount: { type: 'number' },
              date: { type: 'string', format: 'date' },
              categoryid: { type: 'integer' },
              description: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async function (request, reply) {
    const client = await fastify.pg.connect()

    try {
      const { rows } = await client.query('SELECT * FROM expenses ORDER BY date DESC')
      return rows
    } catch (error) {
      request.log.error(error)
      reply.code(500).send({ error: 'Internal Server Error' })
    } finally {
      if (client) {
        client.release()
      }
    }
  })

  // POST /expenses - Create a new expense
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'amount', 'categoryId'],
        properties: {
          name: { type: 'string' },
          amount: { type: 'number' },
          date: { type: 'string', format: 'date' },
          categoryId: { type: 'integer' },
          description: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            categoryid: { type: 'integer' },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const client = await fastify.pg.connect()

    try {
      const { name, amount, date = new Date().toISOString().split('T')[0], categoryId, description = '' } = request.body

      const { rows } = await client.query(
        'INSERT INTO expenses (name, amount, date, categoryId, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, amount, date, categoryId, description]
      )

      reply.code(201).send(rows[0])
    } catch (error) {
      request.log.error(error)
      reply.code(500).send({ error: 'Internal Server Error' })
    } finally {
      if (client) {
        client.release()
      }
    }
  })

  // GET /expenses/:id - Get an expense by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            categoryid: { type: 'integer' },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const client = await fastify.pg.connect()

    try {
      const { id } = request.params

      const { rows } = await client.query('SELECT * FROM expenses WHERE id = $1', [id])

      if (rows.length === 0) {
        reply.code(404).send({ error: 'Expense not found' })
        return
      }

      return rows[0]
    } catch (error) {
      request.log.error(error)
      reply.code(500).send({ error: 'Internal Server Error' })
    } finally {
      if (client) {
        client.release()
      }
    }
  })

  // PUT /expenses/:id - Update an expense by ID
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          amount: { type: 'number' },
          date: { type: 'string', format: 'date' },
          categoryId: { type: 'integer' },
          description: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            categoryid: { type: 'integer' },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const client = await fastify.pg.connect()

    try {
      const { id } = request.params
      const updates = request.body

      // Check if expense exists
      const { rows: existing } = await client.query('SELECT * FROM expenses WHERE id = $1', [id])

      if (existing.length === 0) {
        reply.code(404).send({ error: 'Expense not found' })
        return
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
    } catch (error) {
      request.log.error(error)
      reply.code(500).send({ error: 'Internal Server Error' })
    } finally {
      if (client) {
        client.release()
      }
    }
  })

  // DELETE /expenses/:id - Delete an expense by ID
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' }
        }
      },
      response: {
        204: {
          type: 'null'
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const client = await fastify.pg.connect()

    try {
      const { id } = request.params

      const { rowCount } = await client.query('DELETE FROM expenses WHERE id = $1', [id])

      if (rowCount === 0) {
        reply.code(404).send({ error: 'Expense not found' })
        return
      }

      reply.code(204).send()
    } catch (error) {
      request.log.error(error)
      reply.code(500).send({ error: 'Internal Server Error' })
    } finally {
      if (client) {
        client.release()
      }
    }
  })
}