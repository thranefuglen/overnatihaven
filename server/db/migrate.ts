import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { sql } from '@vercel/postgres';
import { logger } from '../config/logger';

function readSchema(): string {
  // Candidate paths in priority order:
  // 1. Same directory as this file (tsx direct run — tsx polyfills __dirname)
  // 2. ../server/db/ relative to __dirname (esbuild CJS bundle, __dirname = api/)
  // 3. project root fallback (Vercel runtime cwd)
  const candidates = [
    path.join(__dirname, 'schema.postgres.sql'),
    path.join(__dirname, '../server/db/schema.postgres.sql'),
    path.join(process.cwd(), 'server/db/schema.postgres.sql'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf8');
    }
  }

  throw new Error(`schema.postgres.sql not found. Tried:\n${candidates.join('\n')}`);
}

/**
 * Run database migrations against Vercel Postgres.
 * Idempotent: uses IF NOT EXISTS and ON CONFLICT DO NOTHING throughout.
 */
export async function runMigrations(): Promise<void> {
  const schema = readSchema();

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
const isMain = process.argv[1]?.replace(/\\/g, '/').endsWith('server/db/migrate.ts');
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
