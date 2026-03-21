import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { logger } from '../config/logger';
import schema from './schema.postgres.sql';

/**
 * Run database migrations against Vercel Postgres.
 * Idempotent: uses IF NOT EXISTS and ON CONFLICT DO NOTHING throughout.
 */
export async function runMigrations(): Promise<void> {

  // Split on semicolons, strip comment lines, filter empty
  const statements = schema
    .split(';')
    .map(s =>
      s
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(s => s.length > 0);

  logger.info(`Running ${statements.length} migration statements`);

  for (const statement of statements) {
    await sql.query(statement);
  }

  logger.info('Database migrations completed successfully');
}

// Run if executed directly: tsx server/db/migrate.ts
const isMain = /migrate\.(ts|cjs|js)$/.test(process.argv[1]?.replace(/\\/g, '/') ?? '');
if (isMain) {
  runMigrations()
    .then(() => {
      logger.info('Migration completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Migration failed', { error });
      process.exit(1);
    });
}
