import { getDatabase } from '../db/database';
import { Contact, CreateContactInput } from '../types';

export class ContactRepository {
  /**
   * Create a new contact message
   */
  async create(data: CreateContactInput): Promise<Contact> {
    const db = getDatabase();
    
    const result = db.prepare(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES (?, ?, ?, ?)`
    ).run(
      data.name,
      data.email,
      data.subject || null,
      data.message
    );
    
    return (await this.findById(result.lastInsertRowid as number))!;
  }

  /**
   * Find contact by ID
   */
  async findById(id: number): Promise<Contact | undefined> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    return row as Contact | undefined;
  }

  /**
   * Get all contact messages
   */
  async findAll(filters?: { isRead?: boolean; limit?: number }): Promise<Contact[]> {
    const db = getDatabase();
    
    let query = 'SELECT * FROM contacts';
    const params: unknown[] = [];
    
    if (filters?.isRead !== undefined) {
      query += ' WHERE is_read = ?';
      params.push(filters.isRead ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const rows = db.prepare(query).all(...params);
    return rows as Contact[];
  }

  /**
   * Mark contact as read
   */
  async markAsRead(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = db.prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Delete contact
   */
  async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

export const contactRepository = new ContactRepository();
