import { query, queryOne, execute } from '../db/database.postgres';
import { Contact, CreateContactInput } from '../types';

export class ContactRepository {
  /**
   * Create a new contact message
   */
  async create(data: CreateContactInput): Promise<Contact> {
    const result = await queryOne<{ id: number }>(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.subject || null,
        data.message
      ]
    );

    if (!result) {
      throw new Error('Failed to create contact');
    }

    return (await this.findById(result.id))!;
  }

  /**
   * Find contact by ID
   */
  async findById(id: number): Promise<Contact | undefined> {
    const row = await queryOne<Contact>('SELECT * FROM contacts WHERE id = $1', [id]);
    return row || undefined;
  }

  /**
   * Get all contact messages
   */
  async findAll(filters?: { isRead?: boolean; limit?: number }): Promise<Contact[]> {
    let queryText = 'SELECT * FROM contacts';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.isRead !== undefined) {
      queryText += ` WHERE is_read = $${paramIndex++}`;
      params.push(filters.isRead);
    }

    queryText += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const rows = await query<Contact>(queryText, params);
    return rows;
  }

  /**
   * Mark contact as read
   */
  async markAsRead(id: number): Promise<boolean> {
    const result = await execute('UPDATE contacts SET is_read = true WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  /**
   * Delete contact
   */
  async delete(id: number): Promise<boolean> {
    const result = await execute('DELETE FROM contacts WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

export const contactRepository = new ContactRepository();
