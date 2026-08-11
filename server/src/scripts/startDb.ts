import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createEmbeddedPostgres,
  embeddedConnectionString,
  EMBEDDED_PG,
} from './embeddedPg.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../.env')

async function main() {
  fs.mkdirSync(EMBEDDED_PG.databaseDir, { recursive: true })

  const pg = await createEmbeddedPostgres()
  const alreadyInitialized = fs.existsSync(path.join(EMBEDDED_PG.databaseDir, 'PG_VERSION'))

  if (!alreadyInitialized) {
    console.log('Initializing embedded PostgreSQL cluster...')
    await pg.initialise()
  } else {
    console.log('Using existing embedded PostgreSQL data directory...')
  }

  console.log(`Starting PostgreSQL on port ${EMBEDDED_PG.port}...`)
  await pg.start()

  try {
    await pg.createDatabase(EMBEDDED_PG.database)
    console.log(`Database "${EMBEDDED_PG.database}" ready.`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/already exists/i.test(message)) {
      console.log(`Database "${EMBEDDED_PG.database}" already exists.`)
    } else {
      throw error
    }
  }

  const connection = embeddedConnectionString()
  const envContents = [
    `PORT=4000`,
    `DATABASE_URL=${connection}`,
    `JWT_SECRET=leanchem-phase1-dev-secret-change-me`,
    `JWT_EXPIRES_IN=8h`,
    `REFRESH_TOKEN_EXPIRES_IN=7d`,
    `UPLOAD_DIR=uploads`,
    `CORS_ORIGIN=http://localhost:5173`,
    `USE_EMBEDDED_PG=true`,
  ].join('\n')
  fs.writeFileSync(envPath, `${envContents}\n`, 'utf8')
  console.log(`Wrote ${envPath}`)
  console.log(`DATABASE_URL=${connection}`)
  console.log('Embedded PostgreSQL is running. Keep this process open while using the API.')
  console.log('Next: npm run db:migrate')

  const stop = async () => {
    console.log('\nStopping embedded PostgreSQL...')
    try {
      await pg.stop()
    } catch {
      /* ignore */
    }
    process.exit(0)
  }
  process.on('SIGINT', () => void stop())
  process.on('SIGTERM', () => void stop())

  // Keep alive
  await new Promise(() => undefined)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
