'use strict'

const pg = require('pg')
const Postgrator = require('postgrator').default
const path = require('node:path')
const dotenv = require('dotenv')

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.join(__dirname, '..', '.env.test') })
} else {
  dotenv.config()
}

class TestMigrator {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'expense_tracker_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    }
  }

  async createTestDatabase() {
    // Connect to postgres database to create test database
    const adminClient = new pg.Client({
      ...this.config,
      database: 'postgres' // Connect to default postgres database
    })

    try {
      await adminClient.connect()
      
      // Drop test database if exists and create new one
      await adminClient.query(`DROP DATABASE IF EXISTS "${this.config.database}"`)
      await adminClient.query(`CREATE DATABASE "${this.config.database}"`)
      
      console.log(`Test database "${this.config.database}" created successfully`)
    } catch (error) {
      console.error('Error creating test database:', error)
      throw error
    } finally {
      await adminClient.end()
    }
  }

  async runMigrations() {
    const client = new pg.Client(this.config)

    try {
      await client.connect()
      
      const postgrator = new Postgrator({
        migrationPattern: path.join(__dirname, '..', 'migrations', '*'),
        driver: 'pg',
        database: this.config.database,
        schemaTable: 'migrations',
        currentSchema: 'public',
        execQuery: (query) => client.query(query),
      })

      const result = await postgrator.migrate()
      
      if (result.length === 0) {
        console.log('No migrations to run. Database is up to date.')
      } else {
        console.log(`Applied ${result.length} migrations to test database`)
      }

      return result
    } catch (error) {
      console.error('Error running migrations:', error)
      throw error
    } finally {
      await client.end()
    }
  }

  async dropTestDatabase() {
    const adminClient = new pg.Client({
      ...this.config,
      database: 'postgres'
    })

    try {
      await adminClient.connect()
      
      // Terminate all connections to the test database
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${this.config.database}'
          AND pid <> pg_backend_pid()
      `)
      
      await adminClient.query(`DROP DATABASE IF EXISTS "${this.config.database}"`)
      console.log(`Test database "${this.config.database}" dropped successfully`)
    } catch (error) {
      console.error('Error dropping test database:', error)
      throw error
    } finally {
      await adminClient.end()
    }
  }

  async resetDatabase() {
    await this.createTestDatabase()
    await this.runMigrations()
  }

  async clearAllTables() {
    const client = new pg.Client(this.config)

    try {
      await client.connect()
      
      // Get all table names except migrations
      const { rows } = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'migrations'
        ORDER BY tablename
      `)

      // Clear all tables in reverse order to handle foreign keys
      const tableNames = rows.map(row => row.tablename).reverse()
      
      for (const tableName of tableNames) {
        await client.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`)
      }

      console.log(`Cleared ${tableNames.length} tables`)
    } catch (error) {
      console.error('Error clearing tables:', error)
      throw error
    } finally {
      await client.end()
    }
  }
}

module.exports = { TestMigrator }
