import 'dotenv/config'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { embeddedConnectionString } from './embeddedPg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Client } = pg

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL ?? embeddedConnectionString()

  const schema = fs.readFileSync(path.resolve(__dirname, '../../../db/001_schema.sql'), 'utf8')
  const seed = fs.readFileSync(path.resolve(__dirname, '../../../db/002_seed.sql'), 'utf8')

  const client = new Client({ connectionString })
  await client.connect()

  try {
    await client.query('BEGIN')
    await client.query(`
      DROP TABLE IF EXISTS order_documents CASCADE;
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS sample_requests CASCADE;
      DROP TABLE IF EXISTS product_documents CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS company_documents CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TYPE IF EXISTS canonical_order_status CASCADE;
    `)
    await client.query(schema)
    await client.query(seed)

    const hash = await bcrypt.hash('DemoPass123!', 12)
    await client.query(`UPDATE users SET password_hash = $1`, [hash])

    await client.query('COMMIT')
    console.log('Schema + seed applied successfully.')
    console.log('Demo login: buyer@leanchem.demo / DemoPass123!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

migrate()
