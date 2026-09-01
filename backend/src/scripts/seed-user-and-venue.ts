import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import initUser from '../models/user.model';
import initVenue from '../models/venue.model';

// Initialize models with the sequelize instance
const User = initUser(sequelize);
const Venue = initVenue(sequelize);

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await sequelize.authenticate();

    // 1. Seed User
    const userEmail = process.argv[2] || process.env.DEFAULT_USER_EMAIL || 'admin@mail.com';
    const userPassword = process.argv[3] || process.env.DEFAULT_USER_PASSWORD || 'admin123';
    const userName = process.argv[4] || process.env.DEFAULT_USER_NAME || 'Admin Staff';
    const userRole = process.argv[5] || process.env.DEFAULT_USER_ROLE || 'admin';

    console.log(`[Seed] Creating/updating user: ${userEmail}...`);
    const password_hash = await bcrypt.hash(userPassword, 10);

    const [user, userCreated] = await User.findOrCreate({
      where: { email: userEmail },
      defaults: {
        email: userEmail,
        password: password_hash,
        name: userName,
        role: userRole,
      },
    });

    if (!userCreated) {
      user.password = password_hash;
      user.name = userName;
      user.role = userRole;
      await user.save();
    }

    // 2. Seed Venue
    const venueName = process.env.DEFAULT_VENUE_NAME || 'Downtown Store';
    const venueEmail = process.env.DEFAULT_VENUE_EMAIL || 'venue@mail.com';
    const venuePhone = process.env.DEFAULT_VENUE_PHONE || '+15550199';

    console.log(`[Seed] Creating/updating venue: ${venueName}...`);
    const [venue, venueCreated] = await Venue.findOrCreate({
      where: { name: venueName },
      defaults: {
        name: venueName,
        email: venueEmail,
        phone: venuePhone,
        associated_users: [user.id],
      },
    });

    if (!venueCreated) {
      venue.email = venueEmail;
      venue.phone = venuePhone;
      if (!venue.associated_users.includes(user.id)) {
        venue.associated_users = [...venue.associated_users, user.id];
      }
      await venue.save();
    }

    console.log('--------------------------------------------------');
    console.log(`[Seed Success] Database Seeded Successfully:`);
    console.log(`  User ID:    ${user.id}`);
    console.log(`  User Email: ${user.email}`);
    console.log(`  Role:       ${user.role}`);
    console.log(`  Venue ID:   ${venue.id}`);
    console.log(`  Venue Name: ${venue.name}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seedDatabase();