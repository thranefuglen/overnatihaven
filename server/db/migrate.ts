import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from '@vercel/postgres';
import { logger } from '../config/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations against Vercel Postgres
 */
export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.postgres.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

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
