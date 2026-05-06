require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const TEST_ACCOUNTS = [
  {
    name: 'Admin Forge',
    email: 'admin@droneforge.io',
    password: 'Admin@1234',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Test Pilot',
    email: 'pilot@droneforge.io',
    password: 'Pilot@1234',
    role: 'user',
    isActive: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  for (const acc of TEST_ACCOUNTS) {
    const existing = await User.findOne({ email: acc.email });
    if (existing) {
      console.log(`  Already exists: ${acc.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(acc.password, 12);
    await User.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role, isActive: acc.isActive });
    console.log(`  Created ${acc.role}: ${acc.email} / ${acc.password}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => { console.error(err); process.exit(1); });
