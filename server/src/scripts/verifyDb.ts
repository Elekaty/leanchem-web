import 'dotenv/config'
import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const tables = await client.query(
  `SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY 1`,
)
const products = await client.query(`SELECT COUNT(*)::int AS n FROM products`)
const orders = await client.query(`SELECT COUNT(*)::int AS n FROM orders`)
const policies = await client.query(`SELECT COUNT(*)::int AS n FROM pg_policies`)

console.log('tables=' + tables.rows.map((r) => r.table_name).join(','))
console.log('products=' + products.rows[0].n)
console.log('orders=' + orders.rows[0].n)
console.log('policies=' + policies.rows[0].n)

await client.end()
