#!/usr/bin/env node
'use strict'

const { TestMigrator } = require('./test-migrator')

const command = process.argv[2]

async function main() {
  const migrator = new TestMigrator()

  try {
    switch (command) {
      case 'setup':
        console.log('Setting up test database...')
        await migrator.resetDatabase()
        console.log('Test database setup complete!')
        break
      
      case 'teardown':
        console.log('Tearing down test database...')
        await migrator.dropTestDatabase()
        console.log('Test database teardown complete!')
        break
      
      case 'reset':
        console.log('Resetting test database...')
        await migrator.resetDatabase()
        console.log('Test database reset complete!')
        break
      
      case 'clear':
        console.log('Clearing test database tables...')
        await migrator.clearAllTables()
        console.log('Test database tables cleared!')
        break
      
      default:
        console.log('Usage: node test-db.js <command>')
        console.log('Commands:')
        console.log('  setup    - Create test database and run migrations')
        console.log('  teardown - Drop test database')
        console.log('  reset    - Drop and recreate test database with migrations')
        console.log('  clear    - Clear all data from test database tables')
        process.exit(1)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
