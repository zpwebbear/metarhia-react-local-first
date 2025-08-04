# Testing Guide

This guide explains how to run E2E tests against a separate test database.

## Test Environment Setup

### Database Configuration

The tests use a separate test database configured in `.env.test`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=expense_tracker_test
```

### Environment Variables

- Tests automatically load `.env.test` when `NODE_ENV=test`
- Production uses `.env`
- The env plugin automatically selects the correct file based on `NODE_ENV`

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only expenses tests
npm run test:expenses

# Run expenses tests in watch mode
npm run test:expenses:watch
```

### Manual Database Management

```bash
# Setup test database (create + migrate)
npm run test:setup

# Teardown test database (drop)
npm run test:teardown

# Or use the test-db script directly
node test/test-db.js setup
node test/test-db.js teardown
node test/test-db.js reset
node test/test-db.js clear
```

## Test Database Lifecycle

1. **Before Test Suite**: Creates fresh test database and runs migrations
2. **Before Each Test**: Sets up test data (categories)
3. **After Each Test**: Cleans up test data
4. **After Test Suite**: Drops test database

## Test Structure

```
test/
├── helper.js              # Main test helper with database setup
├── test-migrator.js       # Database migration utilities
├── test-helpers.js        # Test data setup helpers
├── test-db.js            # Manual database management script
└── routes/
    └── expenses.test.js   # E2E tests for expenses routes
```

## Key Features

### Database Isolation
- Each test suite gets a fresh database
- Tests don't interfere with each other
- Production database is never touched

### Automatic Migration
- Test database is automatically migrated before tests
- Migrations are run using the same Postgrator setup as production

### Test Data Management
- Helper functions for creating test categories and expenses
- Automatic cleanup after tests
- Realistic test data setup

### Environment Separation
- Test environment completely separate from production
- Different database, same schema
- Environment-specific configuration

## Writing New Tests

1. Import the test helpers:
```javascript
const { build, setupTestDatabase, teardownTestDatabase } = require('../helper')
const { setupTestData, cleanupTestData } = require('../test-helpers')
```

2. Set up the test suite:
```javascript
test('My Test Suite', async (t) => {
  await setupTestDatabase()
  const app = await build(t)
  const testData = await setupTestData(app)
  
  t.after(async () => {
    await cleanupTestData(app)
    await teardownTestDatabase()
  })
  
  // Your tests here...
})
```

3. Use `app.inject()` for making requests:
```javascript
const response = await app.inject({
  method: 'GET',
  url: '/expenses'
})
```

## Prerequisites

- PostgreSQL server running
- User with permission to create/drop databases
- All dependencies installed (`npm install`)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check credentials in `.env.test`
- Verify user has database creation permissions

### Migration Issues
- Ensure migration files are in `migrations/` directory
- Check migration file naming convention
- Verify database permissions

### Test Isolation Issues
- Each test suite should call `setupTestDatabase()` and `teardownTestDatabase()`
- Use `cleanupTestData()` to ensure clean state between tests
