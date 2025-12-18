import { getDatabase } from '../db/database';
import { CreateInquiryInput, Inquiry, InquiryStatus } from '../types';

export class InquiryRepository {
  /**
   * Create a new inquiry
   */
  async create(data: CreateInquiryInput): Promise<Inquiry> {
    const db = getDatabase();
    
    const result = db.prepare(
      `INSERT INTO inquiries (name, email, phone, arrival_date, departure_date, num_people, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.name,
      data.email,
      data.phone || null,
      data.arrivalDate,
      data.departureDate,
      data.numPeople,
      data.message || null
    );
    
    return (await this.findById(result.lastInsertRowid as number))!;
  }

  /**
   * Find inquiry by ID
   */
  async findById(id: number): Promise<Inquiry | undefined> {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    return row as Inquiry | undefined;
  }

  /**
   * Get all inquiries with optional filtering
   */
  async findAll(filters?: { status?: InquiryStatus; limit?: number }): Promise<Inquiry[]> {
    const db = getDatabase();
    
    let query = 'SELECT * FROM inquiries';
    const params: unknown[] = [];
    
    if (filters?.status) {
      query += ' WHERE status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const rows = db.prepare(query).all(...params);
    return rows as Inquiry[];
  }

  /**
   * Update inquiry status
   */
  async updateStatus(id: number, status: InquiryStatus): Promise<boolean> {
    const db = getDatabase();
    const result = db.prepare(
      `UPDATE inquiries 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(status, id);
    
    return result.changes > 0;
  }

  /**
   * Delete inquiry
   */
  async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Check for overlapping bookings
   */
  async hasOverlap(arrivalDate: string, departureDate: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    
    let query = `
      SELECT COUNT(*) as count
      FROM inquiries
      WHERE status IN ('confirmed', 'pending')
      AND (
        (arrival_date <= ? AND departure_date > ?)
        OR (arrival_date < ? AND departure_date >= ?)
        OR (arrival_date >= ? AND departure_date <= ?)
      )
    `;
    
    const params: unknown[] = [
      arrivalDate, arrivalDate,
      departureDate, departureDate,
      arrivalDate, departureDate,
    ];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const row = db.prepare(query).get(...params) as { count: number };
    
    return row.count > 0;
  }
}

export const inquiryRepository = new InquiryRepository();
