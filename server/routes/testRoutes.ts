import { Router, Request, Response } from 'express';
import { config } from '../config/env';
import { execute } from '../db/database.postgres';
import { logger } from '../config/logger';

const router = Router();

/**
 * POST /api/test/reset
 * Resets database to known state for E2E testing.
 * Only available when NODE_ENV=test.
 */
router.post('/reset', async (_req: Request, res: Response) => {
  if (config.nodeEnv !== 'test') {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }

  try {
    // Delete all data from tables
    await execute('DELETE FROM inquiries');
    await execute('DELETE FROM contacts');
    await execute('DELETE FROM gallery_images');
    await execute('DELETE FROM facilities');

    // Re-seed admin user
    await execute(
      `INSERT INTO admin_users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      ['admin', '$2b$10$XWTwpMUZWNMH2hnn8./Xx.ZK79.lPklnXEiwnhUJ6hrhxrCPXiQAO']
    );

    // Re-seed facilities
    await execute(
      `INSERT INTO facilities (title, description, icon_name, is_active, sort_order)
       VALUES
         ('Toilet & Bad', 'Adgang til toilet og brusebad i forbindelse med overnatningen', 'Home', true, 1),
         ('Strøm', 'Mulighed for at oplade telefon og cykellygter', 'Zap', true, 2),
         ('Køkkenadgang', 'Mulighed for at tilberede let mad og drikke', 'UtensilsCrossed', true, 3),
         ('WiFi', 'Gratis trådløst internet i hele haven', 'Wifi', true, 4),
         ('Sikkert Område', 'Privat og sikkert område til parkering af cykler', 'ShieldCheck', true, 5),
         ('Udendørs Lys', 'God belysning i haven om aftenen', 'Moon', true, 6),
         ('Fælles Opholdsrum', 'Hyggeligt område at møde andre cyklister', 'Users', true, 7),
         ('Kort & Vejledning', 'Hjælp til at planlægge din videre rute', 'Map', true, 8)
       ON CONFLICT (title) DO NOTHING`
    );

    // No stock gallery images — gallery starts empty after reset

    logger.info('Test database reset completed');
    res.json({ success: true, message: 'Database reset to known state' });
  } catch (error) {
    logger.error('Test database reset failed', { error });
    res.status(500).json({ success: false, message: 'Reset failed' });
  }
});

export default router;
