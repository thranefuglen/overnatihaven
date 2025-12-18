import { sql } from '@vercel/postgres';

/**
 * Execute a query that returns multiple rows
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query that returns a single row
 */
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  try {
    const result = await sql.query(text, params);
    return result.rows[0] as T || null;
  } catch (error) {
    console.error('Database queryOne error:', error);
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export async function execute(text: string, params: any[] = []): Promise<{ rowCount: number; insertId?: number }> {
  try {
    const result = await sql.query(text, params);
    // For INSERT queries with RETURNING, get the id from the first row
    const insertId = result.rows[0]?.id;
    return {
      rowCount: result.rowCount || 0,
      insertId
    };
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * Convert ? placeholders to $1, $2, etc. for Postgres
 */
export function convertPlaceholders(query: string): string {
  let index = 1;
  return query.replace(/\?/g, () => `$${index++}`);
}

export { sql };
