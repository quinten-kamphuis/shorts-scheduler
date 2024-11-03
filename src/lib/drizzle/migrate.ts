import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

const main = async () => {
  try {
    await migrate(drizzle(migrationClient), {
      migrationsFolder: './src/lib/drizzle/migrations',
    });
    console.log('Migrated successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

main();
