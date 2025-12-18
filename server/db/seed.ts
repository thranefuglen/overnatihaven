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
          title: 'Campingplads ved søen',
          description: 'Smuk beliggenhed ved vandet med plads til telte',
          image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop',
          sort_order: 1,
        },
        {
          title: 'Hyggelig bålplads',
          description: 'Fælles bålplads til hyggelige aftener',
          image_url: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop',
          sort_order: 2,
        },
        {
          title: 'Natur og frisk luft',
          description: 'Omgivet af smuk natur og grønne områder',
          image_url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop',
          sort_order: 3,
        },
        {
          title: 'Faciliteter',
          description: 'Rene og moderne faciliteter for gæster',
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
          sort_order: 4,
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