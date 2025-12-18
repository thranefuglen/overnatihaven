import { sql } from '@vercel/postgres';

export { sql };

export async function query(text: string, params?: any[]) {
  const result = await sql.query(text, params);
  return result;
}
