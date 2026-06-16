import { Request, Response } from 'express';
import { availabilityRepository } from '../repositories/availabilityRepository';
import { upsertAvailabilitySchema, updateSeasonSchema } from '../types';
import { logger } from '../config/logger';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class AvailabilityController {
  /**
   * GET /api/availability (public)
   * Returns season config + all occupied days. The client computes per-day status.
   */
  async getAvailability(_req: Request, res: Response): Promise<void> {
    try {
      const [season, days] = await Promise.all([
        availabilityRepository.getSeason(),
        availabilityRepository.getOccupiedDays(),
      ]);
      res.status(200).json({ success: true, data: { season, days } });
    } catch (error) {
      logger.error('Error fetching availability', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke hente tilgængelighed' });
    }
  }

  /**
   * PUT /api/availability/season (admin)
   */
  async updateSeason(req: Request, res: Response): Promise<void> {
    try {
      const parsed = updateSeasonSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message ?? 'Ugyldige sæsondatoer' });
        return;
      }
      const season = await availabilityRepository.updateSeason(parsed.data.season_start, parsed.data.season_end);
      res.status(200).json({ success: true, data: season });
    } catch (error) {
      logger.error('Error updating season', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke opdatere sæson' });
    }
  }

  /**
   * PUT /api/availability/:date (admin)
   */
  async upsertDay(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      if (!DATE_RE.test(date)) {
        res.status(400).json({ success: false, message: 'Ugyldig dato' });
        return;
      }
      const parsed = upsertAvailabilitySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0]?.message ?? 'Ugyldige data' });
        return;
      }
      const day = await availabilityRepository.upsertDay(date, parsed.data.shelter_occupied, parsed.data.tents_occupied);
      res.status(200).json({ success: true, data: day });
    } catch (error) {
      logger.error('Error updating availability', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke opdatere dagen' });
    }
  }

  /**
   * DELETE /api/availability/:date (admin) — nulstil til alt ledigt.
   */
  async resetDay(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      if (!DATE_RE.test(date)) {
        res.status(400).json({ success: false, message: 'Ugyldig dato' });
        return;
      }
      await availabilityRepository.deleteDay(date);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error resetting availability', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke nulstille dagen' });
    }
  }
}

export const availabilityController = new AvailabilityController();
