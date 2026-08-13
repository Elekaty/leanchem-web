import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(__dirname, '../../../supabase/migrations')

async function main() {
  const connectionString =
    process.env.SUPABASE_DB_URL ??
    process.env.DATABASE_URL

  if (!connectionString) {
    console.error(
      'Missing SUPABASE_DB_URL (or DATABASE_URL).\n' +
        'In Supabase: Project Settings → Database → Connection string (URI).\n' +
        'Use the "Session mode" URI, then:\n' +
        '  set SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-....pooler.supabase.com:5432/postgres\n' +
        '  npm --prefix server run db:supabase',
    )
    process.exit(1)
  }

  if (/localhost|127\.0\.0\.1/.test(connectionString) && !process.env.SUPABASE_DB_URL) {
    console.warn(
      'Warning: DATABASE_URL points at localhost. Set SUPABASE_DB_URL to your Supabase URI to push remotely.',
    )
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const isSupabase = /supabase\.co/i.test(connectionString)
  const parsed = new URL(connectionString)
  const client = new pg.Client({
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: parsed.pathname.replace(/^\//, '') || 'postgres',
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  })

  await client.connect()
  console.log(`Connected. Applying ${files.length} migration(s)...`)

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      console.log(`→ ${file}`)
      await client.query(sql)
      console.log(`  ok`)
    }
    const check = await client.query(
      `SELECT COUNT(*)::int AS n FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('companies','users','products','orders')`,
    )
    console.log(`Supabase schema applied. Core tables present: ${check.rows[0].n}/4`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
