import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { CreateInquiryInput, CreateContactInput } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    // Check if email is configured
    if (!config.email.user || !config.email.pass) {
      logger.warn('Email not configured. Email notifications will not be sent.');
      // Return a dummy transporter for development
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    return this.transporter;
  }

  /**
   * Send booking inquiry notification to owner
   */
  async sendInquiryNotification(inquiry: CreateInquiryInput & { id: number }): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject: `Ny booking forespørgsel - ${inquiry.name}`,
        html: `
          <h2>Ny booking forespørgsel</h2>
          <p><strong>Navn:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> ${inquiry.email}</p>
          ${inquiry.phone ? `<p><strong>Telefon:</strong> ${inquiry.phone}</p>` : ''}
          <p><strong>Ankomst:</strong> ${inquiry.arrivalDate}</p>
          <p><strong>Afrejse:</strong> ${inquiry.departureDate}</p>
          <p><strong>Antal personer:</strong> ${inquiry.numPeople}</p>
          ${inquiry.message ? `<p><strong>Besked:</strong><br>${inquiry.message}</p>` : ''}
          <hr>
          <p><small>Booking ID: ${inquiry.id}</small></p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Inquiry notification sent for ID: ${inquiry.id}`);
    } catch (error) {
      logger.error('Failed to send inquiry notification', { error, inquiryId: inquiry.id });
      // Don't throw - email failure shouldn't break the booking process
    }
  }

  /**
   * Send booking confirmation to guest
   */
  async sendInquiryConfirmation(email: string, name: string): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'Tak for din forespørgsel - Elins Overnatningshave',
        html: `
          <h2>Tak for din forespørgsel</h2>
          <p>Kære ${name},</p>
          <p>Vi har modtaget din booking forespørgsel og vil vende tilbage til dig hurtigst muligt.</p>
          <p>Du vil modtage en bekræftelse på email når din booking er behandlet.</p>
          <br>
          <p>Med venlig hilsen,<br>Elin</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Confirmation email sent to: ${email}`);
    } catch (error) {
      logger.error('Failed to send confirmation email', { error, email });
    }
  }

  /**
   * Send contact form notification
   */
  async sendContactNotification(contact: CreateContactInput & { id: number }): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject: `Ny kontaktbesked - ${contact.name}${contact.subject ? ` (${contact.subject})` : ''}`,
        html: `
          <h2>Ny kontaktbesked</h2>
          <p><strong>Navn:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          ${contact.subject ? `<p><strong>Emne:</strong> ${contact.subject}</p>` : ''}
          <p><strong>Besked:</strong><br>${contact.message}</p>
          <hr>
          <p><small>Kontakt ID: ${contact.id}</small></p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Contact notification sent for ID: ${contact.id}`);
    } catch (error) {
      logger.error('Failed to send contact notification', { error, contactId: contact.id });
    }
  }
}

export const emailService = new EmailService();
