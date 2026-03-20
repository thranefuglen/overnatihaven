import { query, queryOne, execute } from '../db/database.postgres';
import { Facility, CreateFacilityInput, UpdateFacilityInput } from '../types';

export class FacilityRepository {
  async getActiveFacilities(): Promise<Facility[]> {
    return query<Facility>(
      `SELECT id, title, description, icon_name, is_active, sort_order, created_at, updated_at
       FROM facilities
       WHERE is_active = true
       ORDER BY sort_order ASC, created_at ASC`
    );
  }

  async getAllFacilities(): Promise<Facility[]> {
    return query<Facility>(
      `SELECT id, title, description, icon_name, is_active, sort_order, created_at, updated_at
       FROM facilities
       ORDER BY sort_order ASC, created_at ASC`
    );
  }

  async getFacilityById(id: number): Promise<Facility | null> {
    return queryOne<Facility>(
      `SELECT id, title, description, icon_name, is_active, sort_order, created_at, updated_at
       FROM facilities WHERE id = $1`,
      [id]
    );
  }

  async createFacility(data: CreateFacilityInput): Promise<Facility> {
    const maxSortResult = await queryOne<{ max_sort: number | null }>(
      'SELECT MAX(sort_order) as max_sort FROM facilities'
    );
    const sortOrder = (maxSortResult?.max_sort || 0) + 1;

    const result = await queryOne<{ id: number }>(
      `INSERT INTO facilities (title, description, icon_name, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [data.title, data.description ?? null, data.icon_name, data.is_active ?? true, sortOrder]
    );

    if (!result) throw new Error('Failed to create facility');
    const created = await this.getFacilityById(result.id);
    if (!created) throw new Error('Failed to retrieve created facility');
    return created;
  }

  async updateFacility(id: number, data: UpdateFacilityInput): Promise<Facility | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description); }
    if (data.icon_name !== undefined) { fields.push(`icon_name = $${i++}`); values.push(data.icon_name); }
    if (data.is_active !== undefined) { fields.push(`is_active = $${i++}`); values.push(data.is_active); }
    if (data.sort_order !== undefined) { fields.push(`sort_order = $${i++}`); values.push(data.sort_order); }

    if (fields.length === 0) throw new Error('No fields to update');

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await execute(
      `UPDATE facilities SET ${fields.join(', ')} WHERE id = $${i}`,
      values
    );

    if (result.rowCount === 0) return null;
    return this.getFacilityById(id);
  }

  async deleteFacility(id: number): Promise<boolean> {
    const result = await execute('DELETE FROM facilities WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async reorderFacilities(facilityIds: number[]): Promise<void> {
    for (let i = 0; i < facilityIds.length; i++) {
      await execute(
        'UPDATE facilities SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [i + 1, facilityIds[i]]
      );
    }
  }
}

export const facilityRepository = new FacilityRepository();
