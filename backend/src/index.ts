import { Pool } from 'pg'
import { createApp } from './app'
import { PostgresScoutDocumentStore } from './postgresStore'

const port = Number(process.env.PORT || 3000)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({ connectionString: databaseUrl })
const store = new PostgresScoutDocumentStore(pool)

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })

const initializeStoreWithRetry = async (retries = 10) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await store.initialize()
      return
    } catch (error) {
      if (attempt === retries) {
        throw error
      }

      console.warn(`Database initialization failed (attempt ${attempt}/${retries}). Retrying...`)
      await wait(2_000)
    }
  }
}

const start = async () => {
  await initializeStoreWithRetry()

  createApp(store, frontendOrigin).listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`)
  })
}

start().catch(async (error) => {
  console.error(error)
  await pool.end()
  process.exit(1)
})
