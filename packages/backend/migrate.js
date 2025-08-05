const pg = require('pg')
const Postgrator = require('postgrator').default
const path = require('node:path')
const dotenv = require('dotenv')
// Load environment variables from .env file
dotenv.config()

async function createDatabaseIfNotExists() {
  const adminClient = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER || 'example',
    password: process.env.DB_PASSWORD || 'example',
  });

  try {
    await adminClient.connect();
    const dbName = process.env.DB_NAME || 'example';
    
    // Check if database exists
    const result = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    throw err;
  } finally {
    await adminClient.end();
  }
}

async function migrate() {
  // First, ensure the database exists
  await createDatabaseIfNotExists();

  const client = new pg.Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'example',
    user: process.env.DB_USER || 'example',
    password: process.env.DB_PASSWORD || 'example',
  });

  try {
    await client.connect();
    const postgrator = new Postgrator({
      migrationPattern: path.join(__dirname, '/migrations/*'),
      driver: 'pg',
      database: process.env.DB_NAME,
      schemaTable: 'migrations',
      currentSchema: 'public', // Postgres and MS SQL Server only
      execQuery: (query) => client.query(query),
    });

    const result = await postgrator.migrate()

    if (result.length === 0) {
      console.log(
        'No migrations run for schema "public". Already at the latest one.'
      )
    }

    console.log('Migration done.')

    process.exitCode = 0
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }

  await client.end()
}

migrate()