import { Request, Response } from 'express';
import { facilityRepository } from '../repositories/facilityRepository';
import { logger } from '../config/logger';

export class FacilityController {
  async getActiveFacilities(_req: Request, res: Response): Promise<void> {
    try {
      const facilities = await facilityRepository.getActiveFacilities();
      res.status(200).json({ success: true, data: facilities });
    } catch (error) {
      logger.error('Error fetching active facilities', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke hente faciliteter' });
    }
  }

  async getAllFacilities(_req: Request, res: Response): Promise<void> {
    try {
      const facilities = await facilityRepository.getAllFacilities();
      res.status(200).json({ success: true, data: facilities });
    } catch (error) {
      logger.error('Error fetching all facilities', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke hente faciliteter' });
    }
  }

  async createFacility(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, icon_name, is_active } = req.body;
      if (!title || !icon_name) {
        res.status(400).json({ success: false, message: 'Titel og ikon er påkrævet' });
        return;
      }
      const facility = await facilityRepository.createFacility({ title, description, icon_name, is_active });
      res.status(201).json({ success: true, data: facility });
    } catch (error) {
      logger.error('Error creating facility', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke oprette facilitet' });
    }
  }

  async updateFacility(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Ugyldigt ID' });
        return;
      }
      const { title, description, icon_name, is_active } = req.body;
      const updated = await facilityRepository.updateFacility(id, { title, description, icon_name, is_active });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Facilitet ikke fundet' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error updating facility', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke opdatere facilitet' });
    }
  }

  async toggleFacility(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Ugyldigt ID' });
        return;
      }
      const facility = await facilityRepository.getFacilityById(id);
      if (!facility) {
        res.status(404).json({ success: false, message: 'Facilitet ikke fundet' });
        return;
      }
      const updated = await facilityRepository.updateFacility(id, { is_active: !facility.is_active });
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error toggling facility', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke opdatere facilitet' });
    }
  }

  async deleteFacility(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Ugyldigt ID' });
        return;
      }
      const deleted = await facilityRepository.deleteFacility(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Facilitet ikke fundet' });
        return;
      }
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error deleting facility', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke slette facilitet' });
    }
  }

  async reorderFacilities(req: Request, res: Response): Promise<void> {
    try {
      const { facilityIds } = req.body;
      if (!Array.isArray(facilityIds) || facilityIds.length === 0) {
        res.status(400).json({ success: false, message: 'facilityIds er påkrævet' });
        return;
      }
      await facilityRepository.reorderFacilities(facilityIds);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error reordering facilities', { error: (error as Error).message });
      res.status(500).json({ success: false, message: 'Kunne ikke sortere faciliteter' });
    }
  }
}

export const facilityController = new FacilityController();
