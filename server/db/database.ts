import Database from 'better-sqlite3';
import { config } from '../config/env';
import { logger } from '../config/logger';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database | null = null;

/**
 * Initialize database connection
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    // Ensure data directory exists
    const dbPath = path.resolve(__dirname, '../../..', config.database.path);
    const dbDir = path.dirname(dbPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    db = new Database(dbPath);

    // Enable foreign keys and WAL mode
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    logger.info(`Database initialized: ${dbPath}`);

    return db;
  } catch (error) {
    logger.error('Failed to initialize database', { error });
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}