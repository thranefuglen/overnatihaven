import { Request, Response } from 'express';
import { contactService } from '../services/contactService';
import { CreateContactInput } from '../types';

export class ContactController {
  /**
   * Create a new contact message
   */
  async createContact(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateContactInput;
    
    const contact = await contactService.createContact(data);
    
    res.status(201).json({
      success: true,
      message: 'Tak for din besked. Vi vender tilbage til dig hurtigst muligt.',
      data: contact,
    });
  }

  /**
   * Get all contact messages
   */
  async getAllContacts(req: Request, res: Response): Promise<void> {
    const { isRead, limit } = req.query;
    
    const contacts = await contactService.getAllContacts(
      isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      limit ? parseInt(limit as string, 10) : undefined
    );
    
    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  }

  /**
   * Get contact by ID
   */
  async getContactById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    
    const contact = await contactService.getContactById(id);
    
    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Besked ikke fundet',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: contact,
    });
  }
}

export const contactController = new ContactController();
