const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const dbName = (process.env.DB_NAME || 'NUTRIGO').trim();

async function run() {
  console.log(`Starting database setup for: ${dbName}`);
  
  // 1. Connect to postgres database to check/create the target database if not using a connection string
  if (!process.env.DATABASE_URL) {
    const initClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      port: process.env.DB_PORT || 5432,
      database: 'postgres'
    });

    try {
      await initClient.connect();
      const res = await initClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
      if (res.rowCount === 0) {
        console.log(`Database "${dbName}" does not exist. Creating...`);
        await initClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database "${dbName}" created successfully.`);
      } else {
        console.log(`Database "${dbName}" already exists.`);
      }
    } catch (err) {
      console.error('Error checking/creating database:', err);
      process.exit(1);
    } finally {
      await initClient.end();
    }
  }

  // 2. Connect to the target database to run schema and seeds
  const client = process.env.DATABASE_URL
    ? new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      })
    : new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123456',
        port: process.env.DB_PORT || 5432,
        database: dbName
      });

  try {
    await client.connect();
    console.log('Connected to target database successfully.');

    // Path to the sql files (now in the same directory since script is at the root)
    const schemaPath = path.join(__dirname, 'database_schema.sql');
    const ingredientsPath = path.join(__dirname, 'seed_ingredients.sql');
    const recipesPath = path.join(__dirname, 'seed_recipes.sql');

    // Read files
    console.log('Reading database_schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Reading seed_ingredients.sql...');
    const ingredientsSql = fs.readFileSync(ingredientsPath, 'utf8');

    console.log('Reading seed_recipes.sql...');
    const recipesSql = fs.readFileSync(recipesPath, 'utf8');

    // Execute schema
    console.log('Executing database_schema.sql...');
    await client.query(schemaSql);
    console.log('Database schema created successfully.');

    // Execute ingredients
    console.log('Executing seed_ingredients.sql...');
    await client.query(ingredientsSql);
    console.log('Ingredients seeded successfully.');

    // Execute recipes
    console.log('Executing seed_recipes.sql...');
    await client.query(recipesSql);
    console.log('Recipes seeded successfully.');

    console.log('Database setup and seeding completed successfully!');
  } catch (err) {
    console.error('Error executing SQL files:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
