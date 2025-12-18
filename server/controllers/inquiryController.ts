import { Request, Response } from 'express';
import { inquiryService } from '../services/inquiryService';
import { CreateInquiryInput } from '../types';

export class InquiryController {
  /**
   * Create a new inquiry
   */
  async createInquiry(req: Request, res: Response): Promise<void> {
    const data = req.body as CreateInquiryInput;
    
    const inquiry = await inquiryService.createInquiry(data);
    
    res.status(201).json({
      success: true,
      message: 'Din forespørgsel er modtaget. Vi vender tilbage til dig hurtigst muligt.',
      data: inquiry,
    });
  }

  /**
   * Get all inquiries
   */
  async getAllInquiries(req: Request, res: Response): Promise<void> {
    const { status, limit } = req.query;
    
    const inquiries = await inquiryService.getAllInquiries(
      status as string | undefined,
      limit ? parseInt(limit as string, 10) : undefined
    );
    
    res.status(200).json({
      success: true,
      data: inquiries,
      count: inquiries.length,
    });
  }

  /**
   * Get inquiry by ID
   */
  async getInquiryById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    
    const inquiry = await inquiryService.getInquiryById(id);
    
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: 'Forespørgsel ikke fundet',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: inquiry,
    });
  }

  /**
   * Check availability
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    const { arrivalDate, departureDate } = req.query;
    
    if (!arrivalDate || !departureDate) {
      res.status(400).json({
        success: false,
        message: 'Ankomst- og afrejsedato er påkrævet',
      });
      return;
    }
    
    const isAvailable = await inquiryService.checkAvailability(
      arrivalDate as string,
      departureDate as string
    );
    
    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        message: isAvailable 
          ? 'Perioden er tilgængelig' 
          : 'Der er allerede en booking i denne periode',
      },
    });
  }
}

export const inquiryController = new InquiryController();
