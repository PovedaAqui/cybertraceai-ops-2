import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

let _db: ReturnType<typeof drizzle> | null = null;

function createDatabase() {
  if (_db) {
    return _db;
  }

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL environment variable is not set.');
  }

  const sql = postgres(connectionString);
  _db = drizzle(sql);
  return _db;
}

export const getDb = () => createDatabase();

// For backward compatibility, create a proxy that only connects when used
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = createDatabase();
    return database[prop as keyof typeof database];
  }
});