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

    // Re-seed gallery images
    await execute(
      `INSERT INTO gallery_images (title, description, image_url, sort_order, is_active)
       VALUES
         ('Telt i haven', 'Smukt telt omgivet af grønne træer og blomster', 'https://images.unsplash.com/photo-1523987351232-1ca2c5be4eb5?w=800&h=600&fit=crop', 1, true),
         ('Camping plads', 'Rummelig camping plads med god plads til flere telte', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop', 2, true),
         ('Haven ved solnedgang', 'Den smukke have ved solnedgangstidspunkt', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop', 3, true),
         ('Bålplads', 'Hyggelig bålplads til sociale aftener', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop', 4, true),
         ('Faciliteter', 'Rene og velholdte faciliteter for gæster', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', 5, true),
         ('Natursti', 'Smuk natursti i nærheden af campingpladsen', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', 6, true)
       ON CONFLICT (image_url) DO NOTHING`
    );

    logger.info('Test database reset completed');
    res.json({ success: true, message: 'Database reset to known state' });
  } catch (error) {
    logger.error('Test database reset failed', { error });
    res.status(500).json({ success: false, message: 'Reset failed' });
  }
});

export default router;
