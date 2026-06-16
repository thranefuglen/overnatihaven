import { query, queryOne, execute } from '../db/database.postgres';
import { Availability, SeasonConfig } from '../types';

const DEFAULT_SEASON: SeasonConfig = {
  season_start: '2026-06-01',
  season_end: '2026-09-01',
};

export class AvailabilityRepository {
  /**
   * Get the (single) season configuration. Dates returned as YYYY-MM-DD
   * strings via to_char to avoid timezone-skewed Date parsing.
   */
  async getSeason(): Promise<SeasonConfig> {
    const row = await queryOne<SeasonConfig>(
      `SELECT to_char(season_start, 'YYYY-MM-DD') AS season_start,
              to_char(season_end, 'YYYY-MM-DD') AS season_end
       FROM season_config WHERE id = 1`
    );
    return row ?? DEFAULT_SEASON;
  }

  async updateSeason(seasonStart: string, seasonEnd: string): Promise<SeasonConfig> {
    await execute(
      `INSERT INTO season_config (id, season_start, season_end, updated_at)
       VALUES (1, $1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
         SET season_start = EXCLUDED.season_start,
             season_end = EXCLUDED.season_end,
             updated_at = CURRENT_TIMESTAMP`,
      [seasonStart, seasonEnd]
    );
    return this.getSeason();
  }

  /**
   * Only returns days that differ from the default (something occupied).
   */
  async getOccupiedDays(): Promise<Availability[]> {
    return query<Availability>(
      `SELECT to_char(date, 'YYYY-MM-DD') AS date, shelter_occupied, tents_occupied
       FROM availability
       WHERE shelter_occupied = true OR tents_occupied > 0
       ORDER BY date ASC`
    );
  }

  /**
   * Upsert a day. If the day ends up fully free, the row is deleted to keep
   * the table sparse.
   */
  async upsertDay(date: string, shelterOccupied: boolean, tentsOccupied: number): Promise<Availability> {
    if (!shelterOccupied && tentsOccupied === 0) {
      await this.deleteDay(date);
      return { date, shelter_occupied: false, tents_occupied: 0 };
    }

    await execute(
      `INSERT INTO availability (date, shelter_occupied, tents_occupied, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (date) DO UPDATE
         SET shelter_occupied = EXCLUDED.shelter_occupied,
             tents_occupied = EXCLUDED.tents_occupied,
             updated_at = CURRENT_TIMESTAMP`,
      [date, shelterOccupied, tentsOccupied]
    );

    return { date, shelter_occupied: shelterOccupied, tents_occupied: tentsOccupied };
  }

  async deleteDay(date: string): Promise<boolean> {
    const result = await execute('DELETE FROM availability WHERE date = $1', [date]);
    return result.rowCount > 0;
  }
}

export const availabilityRepository = new AvailabilityRepository();
