import 'dotenv/config'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import {
  createEmbeddedPostgres,
  embeddedConnectionString,
  EMBEDDED_PG,
} from './embeddedPg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../.env')
const { Client } = pg

async function applySchema(connectionString: string) {
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
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

async function main() {
  fs.mkdirSync(EMBEDDED_PG.databaseDir, { recursive: true })

  const pgServer = await createEmbeddedPostgres()
  const alreadyInitialized = fs.existsSync(path.join(EMBEDDED_PG.databaseDir, 'PG_VERSION'))

  if (!alreadyInitialized) {
    console.log('Initializing embedded PostgreSQL cluster...')
    await pgServer.initialise()
  } else {
    console.log('Using existing embedded PostgreSQL data directory...')
  }

  console.log(`Starting PostgreSQL on port ${EMBEDDED_PG.port}...`)
  await pgServer.start()

  try {
    await pgServer.createDatabase(EMBEDDED_PG.database)
    console.log(`Created database "${EMBEDDED_PG.database}".`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/already exists/i.test(message)) {
      console.log(`Database "${EMBEDDED_PG.database}" already exists.`)
    } else {
      throw error
    }
  }

  const connection = embeddedConnectionString()
  fs.writeFileSync(
    envPath,
    [
      'PORT=4000',
      `DATABASE_URL=${connection}`,
      'JWT_SECRET=leanchem-phase1-dev-secret-change-me',
      'JWT_EXPIRES_IN=8h',
      'REFRESH_TOKEN_EXPIRES_IN=7d',
      'UPLOAD_DIR=uploads',
      'CORS_ORIGIN=http://localhost:5173',
      'USE_EMBEDDED_PG=true',
      '',
    ].join('\n'),
    'utf8',
  )

  console.log('Applying LeanChem Phase 1 schema + seed...')
  await applySchema(connection)
  console.log('Schema created successfully.')
  console.log(`DATABASE_URL=${connection}`)
  console.log('Demo login: buyer@leanchem.demo / DemoPass123!')
  console.log('Embedded PostgreSQL is running. Keep this terminal open for the API.')

  const stop = async () => {
    console.log('\nStopping embedded PostgreSQL...')
    try {
      await pgServer.stop()
    } catch {
      /* ignore */
    }
    process.exit(0)
  }
  process.on('SIGINT', () => void stop())
  process.on('SIGTERM', () => void stop())
  await new Promise(() => undefined)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
