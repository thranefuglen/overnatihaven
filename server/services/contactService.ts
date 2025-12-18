import { contactRepository } from '../repositories/contactRepository';
import { Contact, CreateContactInput } from '../types';
import { emailService } from './emailService';
import { logger } from '../config/logger';

export class ContactService {
  /**
   * Create a new contact message
   */
  async createContact(data: CreateContactInput): Promise<Contact> {
    try {
      const contact = await contactRepository.create(data);
      logger.info(`Created contact ID: ${contact.id}`, { contact });

      // Send notification (async, don't wait)
      emailService.sendContactNotification({ ...data, id: contact.id });

      return contact;
    } catch (error) {
      logger.error('Failed to create contact', { error, data });
      throw error;
    }
  }

  /**
   * Get all contact messages
   */
  async getAllContacts(isRead?: boolean, limit?: number): Promise<Contact[]> {
    try {
      return await contactRepository.findAll({ isRead, limit });
    } catch (error) {
      logger.error('Failed to get contacts', { error });
      throw error;
    }
  }

  /**
   * Get contact by ID
   */
  async getContactById(id: number): Promise<Contact | undefined> {
    try {
      return await contactRepository.findById(id);
    } catch (error) {
      logger.error('Failed to get contact', { error, id });
      throw error;
    }
  }
}

export const contactService = new ContactService();
