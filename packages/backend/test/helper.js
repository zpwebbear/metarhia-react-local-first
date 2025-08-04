'use strict'

// This file contains code that we reuse
// between our tests.

const { build: buildApplication } = require('fastify-cli/helper')
const path = require('node:path')
const dotenv = require('dotenv')
const { TestMigrator } = require('./test-migrator')

const AppPath = path.join(__dirname, '..', 'app.js')

// Set test environment
process.env.NODE_ENV = 'test'

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') })

// Fill in this config with all the configurations
// needed for testing the application
function config () {
  return {
    skipOverride: true // Register our application with fastify-plugin
  }
}

// automatically build and tear down our instance
async function build (t) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await buildApplication(argv, config())

  // close the app after we are done
  t.after(() => app.close())

  return app
}

// Setup test database for a test suite
async function setupTestDatabase () {
  const migrator = new TestMigrator()
  await migrator.resetDatabase()
  return migrator
}

// Clean up test database after test suite
async function teardownTestDatabase () {
  const migrator = new TestMigrator()
  await migrator.dropTestDatabase()
}

module.exports = {
  config,
  build,
  setupTestDatabase,
  teardownTestDatabase
}
