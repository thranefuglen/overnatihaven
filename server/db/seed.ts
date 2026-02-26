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
          image_url: '/uploads/gallery/616558711_1268700155074587_3384761009880758784_n.jpg',
          sort_order: 1,
        },
        {
          title: 'Naturskønne omgivelser',
          description: 'Omgivet af grønne områder og natur',
          image_url: '/uploads/gallery/617547163_1212805530349898_2661928358546701939_n.jpg',
          sort_order: 2,
        },
        {
          title: 'Blomstrende have',
          description: 'Smukke blomster i haven',
          image_url: '/uploads/gallery/621844054_901536649085318_8093853759389452189_n.jpg',
          sort_order: 3,
        },
        {
          title: 'Haven set fra terrassen',
          description: 'Udsigt over haven',
          image_url: '/uploads/gallery/621795998_2603028566757679_7637224078746343336_n.jpg',
          sort_order: 4,
        },
        {
          title: 'Grønne områder',
          description: 'Fredelige områder til afslapning',
          image_url: '/uploads/gallery/621129142_1414389603476299_5574062650380999838_n.jpg',
          sort_order: 5,
        },
        {
          title: 'Hyggelig atmosfære',
          description: 'Velkommen til haven',
          image_url: '/uploads/gallery/618622088_1586836882208984_8164567257434768372_n.jpg',
          sort_order: 6,
        },
        {
          title: 'Haven i solskin',
          description: 'Smuk dag i haven',
          image_url: '/uploads/gallery/617602750_2066337447486631_2945107752441500504_n.jpg',
          sort_order: 7,
        },
        {
          title: 'Naturlige omgivelser',
          description: 'Naturskøn beliggenhed',
          image_url: '/uploads/gallery/622259576_3146862288834567_8857659111211895017_n.jpg',
          sort_order: 8,
        },
        {
          title: 'Fredelig have',
          description: 'Rolig og fredelig atmosfære',
          image_url: '/uploads/gallery/620161908_857300110453859_5686457950548681746_n.jpg',
          sort_order: 9,
        },
        {
          title: 'Haveudsigt',
          description: 'Smukt udsyn over haven',
          image_url: '/uploads/gallery/IMG_5357.JPEG',
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