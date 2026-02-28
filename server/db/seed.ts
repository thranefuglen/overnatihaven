import { getDatabase } from './database';
import bcrypt from 'bcrypt';

/**
 * Seed database with initial data
 */
export async function seedDatabase(): Promise<void> {
  const db = getDatabase();
  try {
    console.log('Starting database seeding...');

    // Create default admin user
    const adminUsername = 'admin';
    const adminEmail = 'admin@overnatihaven.dk';
    const adminPassword = 'admin123'; // Change this in production!

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists
    const existingAdmin = db.prepare(
      'SELECT id FROM admin_users WHERE username = ? OR email = ?'
    ).get(adminUsername, adminEmail);

    if (!existingAdmin) {
      db.prepare(
        `INSERT INTO admin_users (username, email, password_hash, is_active)
         VALUES (?, ?, ?, ?)`
      ).run(adminUsername, adminEmail, passwordHash, 1);
      console.log('✓ Default admin user created');
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Password: ${adminPassword}`);
      console.log('  ⚠️  Remember to change the default password in production!');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Add some sample gallery images if none exist
    const existingImages = db.prepare(
      'SELECT COUNT(*) as count FROM gallery_images'
    ).get() as { count: number };

    const imageCount = existingImages.count;

    if (imageCount === 0) {
      const sampleImages = [
        {
          title: 'Haven om sommeren',
          description: 'Smuk beliggenhed med plads til telte',
          image_url: '',
          sort_order: 1,
        },
        {
          title: 'Naturskønne omgivelser',
          description: 'Omgivet af grønne områder og natur',
          image_url: '',
          sort_order: 2,
        },
        {
          title: 'Blomstrende have',
          description: 'Smukke blomster i haven',
          image_url: '',
          sort_order: 3,
        },
        {
          title: 'Haven set fra terrassen',
          description: 'Udsigt over haven',
          image_url: '',
          sort_order: 4,
        },
        {
          title: 'Grønne områder',
          description: 'Fredelige områder til afslapning',
          image_url: '',
          sort_order: 5,
        },
        {
          title: 'Hyggelig atmosfære',
          description: 'Velkommen til haven',
          image_url: '',
          sort_order: 6,
        },
        {
          title: 'Haven i solskin',
          description: 'Smuk dag i haven',
          image_url: '',
          sort_order: 7,
        },
        {
          title: 'Naturlige omgivelser',
          description: 'Naturskøn beliggenhed',
          image_url: '',
          sort_order: 8,
        },
        {
          title: 'Fredelig have',
          description: 'Rolig og fredelig atmosfære',
          image_url: '',
          sort_order: 9,
        },
        {
          title: 'Haveudsigt',
          description: 'Smukt udsyn over haven',
          image_url: '',
          sort_order: 10,
        },
      ];

      for (const image of sampleImages) {
        db.prepare(
          `INSERT INTO gallery_images (title, description, image_url, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?)`
        ).run(image.title, image.description, image.image_url, 1, image.sort_order);
      }

      console.log(`✓ ${sampleImages.length} sample gallery images created`);
    } else {
      console.log(`✓ ${imageCount} gallery images already exist`);
    }

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}