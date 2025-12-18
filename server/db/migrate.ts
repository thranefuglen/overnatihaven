import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, closeDatabase } from './database';
import { logger } from '../config/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migrations
 */
export function runMigrations(): void {
  try {
    const db = getDatabase();

    const schemaPath = path.join(__dirname, 'schema.sql');
    logger.info(`Looking for schema.sql at: ${schemaPath}`);

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon, remove comments, and filter out empty statements
    const statements = schema
      .split(';')
      .map(s => {
        // Remove comment lines
        return s
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
      })
      .filter(s => s.length > 0);

    logger.info(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (const statement of statements) {
      try {
        logger.info(`Executing statement: ${statement.substring(0, 100)}...`);
        db.exec(statement);
      } catch (error) {
        logger.error(`Failed to execute statement: ${statement}`, { error });
        // Ignore errors for INSERT OR IGNORE statements
        if (!statement.includes('INSERT OR IGNORE')) {
          throw error;
        }
      }
    }
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Failed to run migrations', { error });
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    logger.info('Starting database migration...');
    runMigrations();
    logger.info('Migration completed successfully');
    closeDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error });
    closeDatabase();
    process.exit(1);
  }
}