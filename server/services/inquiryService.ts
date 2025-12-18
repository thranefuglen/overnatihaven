import { inquiryRepository } from '../repositories/inquiryRepository';
import { CreateInquiryInput, Inquiry } from '../types';
import { emailService } from './emailService';
import { logger } from '../config/logger';

export class InquiryService {
  /**
   * Create a new inquiry
   */
  async createInquiry(data: CreateInquiryInput): Promise<Inquiry> {
    try {
      // Check for overlapping bookings
      const hasOverlap = await inquiryRepository.hasOverlap(data.arrivalDate, data.departureDate);
      
      if (hasOverlap) {
        throw new Error('Der er allerede en booking i denne periode');
      }

      // Create inquiry
      const inquiry = await inquiryRepository.create(data);
      logger.info(`Created inquiry ID: ${inquiry.id}`, { inquiry });

      // Send notifications (async, don't wait)
      emailService.sendInquiryNotification({ ...data, id: inquiry.id });
      emailService.sendInquiryConfirmation(data.email, data.name);

      return inquiry;
    } catch (error) {
      logger.error('Failed to create inquiry', { error, data });
      throw error;
    }
  }

  /**
   * Get all inquiries
   */
  async getAllInquiries(status?: string, limit?: number): Promise<Inquiry[]> {
    try {
      return await inquiryRepository.findAll({
        status: status as Inquiry['status'],
        limit,
      });
    } catch (error) {
      logger.error('Failed to get inquiries', { error });
      throw error;
    }
  }

  /**
   * Get inquiry by ID
   */
  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    try {
      return await inquiryRepository.findById(id);
    } catch (error) {
      logger.error('Failed to get inquiry', { error, id });
      throw error;
    }
  }

  /**
   * Check availability for dates
   */
  async checkAvailability(arrivalDate: string, departureDate: string): Promise<boolean> {
    try {
      return !(await inquiryRepository.hasOverlap(arrivalDate, departureDate));
    } catch (error) {
      logger.error('Failed to check availability', { error, arrivalDate, departureDate });
      throw error;
    }
  }
}

export const inquiryService = new InquiryService();
