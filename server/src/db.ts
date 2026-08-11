import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://leanchem:leanchem@localhost:5432/leanchem',
})

/** Run work inside a transaction with RLS claim set to the authenticated user id. */
export async function withUserContext<T>(
  userId: string | null,
  work: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (userId) {
      await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [userId])
    } else {
      await client.query(`SELECT set_config('request.jwt.claim.sub', '', true)`)
    }
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
