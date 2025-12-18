import { query, queryOne, execute } from '../db/database.postgres';
import { CreateInquiryInput, Inquiry, InquiryStatus } from '../types';

export class InquiryRepository {
  /**
   * Create a new inquiry
   */
  async create(data: CreateInquiryInput): Promise<Inquiry> {
    const result = await queryOne<{ id: number }>(
      `INSERT INTO inquiries (name, email, phone, arrival_date, departure_date, num_people, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.phone || null,
        data.arrivalDate,
        data.departureDate,
        data.numPeople,
        data.message || null
      ]
    );

    if (!result) {
      throw new Error('Failed to create inquiry');
    }

    return (await this.findById(result.id))!;
  }

  /**
   * Find inquiry by ID
   */
  async findById(id: number): Promise<Inquiry | undefined> {
    const row = await queryOne<Inquiry>('SELECT * FROM inquiries WHERE id = $1', [id]);
    return row || undefined;
  }

  /**
   * Get all inquiries with optional filtering
   */
  async findAll(filters?: { status?: InquiryStatus; limit?: number }): Promise<Inquiry[]> {
    let queryText = 'SELECT * FROM inquiries';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      queryText += ` WHERE status = $${paramIndex++}`;
      params.push(filters.status);
    }

    queryText += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    const rows = await query<Inquiry>(queryText, params);
    return rows;
  }

  /**
   * Update inquiry status
   */
  async updateStatus(id: number, status: InquiryStatus): Promise<boolean> {
    const result = await execute(
      `UPDATE inquiries
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, id]
    );

    return result.rowCount > 0;
  }

  /**
   * Delete inquiry
   */
  async delete(id: number): Promise<boolean> {
    const result = await execute('DELETE FROM inquiries WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  /**
   * Check for overlapping bookings
   */
  async hasOverlap(arrivalDate: string, departureDate: string, excludeId?: number): Promise<boolean> {
    let queryText = `
      SELECT COUNT(*) as count
      FROM inquiries
      WHERE status IN ('confirmed', 'pending')
      AND (
        (arrival_date <= $1 AND departure_date > $2)
        OR (arrival_date < $3 AND departure_date >= $4)
        OR (arrival_date >= $5 AND departure_date <= $6)
      )
    `;

    const params: unknown[] = [
      arrivalDate, arrivalDate,
      departureDate, departureDate,
      arrivalDate, departureDate,
    ];

    let paramIndex = 7;
    if (excludeId) {
      queryText += ` AND id != $${paramIndex}`;
      params.push(excludeId);
    }

    const row = await queryOne<{ count: string }>(queryText, params);

    return parseInt(row?.count || '0') > 0;
  }
}

export const inquiryRepository = new InquiryRepository();
