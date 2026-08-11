import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'

async function main() {
  const hash = await bcrypt.hash('DemoPass123!', 12)
  await pool.query(`UPDATE users SET password_hash = $1`, [hash])
  console.log('Updated demo user passwords to DemoPass123!')
  await pool.end()
}

main().catch(async (err) => {
  console.error(err)
  await pool.end()
  process.exit(1)
})
