import path from 'node:path'
import { fileURLToPath } from 'node:url'
import EmbeddedPostgres from 'embedded-postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const EMBEDDED_PG = {
  databaseDir: path.resolve(__dirname, '../../../.data/pg-utf8'),
  user: 'postgres',
  password: 'password',
  port: 5433,
  database: 'leanchem',
}

export function embeddedConnectionString(database = EMBEDDED_PG.database) {
  return `postgresql://${EMBEDDED_PG.user}:${EMBEDDED_PG.password}@127.0.0.1:${EMBEDDED_PG.port}/${database}`
}

export async function createEmbeddedPostgres() {
  const pg = new EmbeddedPostgres({
    databaseDir: EMBEDDED_PG.databaseDir,
    user: EMBEDDED_PG.user,
    password: EMBEDDED_PG.password,
    port: EMBEDDED_PG.port,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    onLog: (message) => {
      const text = String(message)
      if (text.trim()) process.stdout.write(`[pg] ${text}`)
    },
    onError: (message) => {
      console.error('[pg:error]', message)
    },
  })
  return pg
}
