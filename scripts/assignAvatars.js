require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const users = await User.find({ $or: [{ avatarUrl: '' }, { avatarUrl: { $exists: false } }] });
  console.log(`Found ${users.length} users without avatars`);

  // Shuffle 1-20 so first 20 users each get a unique pic; beyond 20 reuse randomly
  const pool = Array.from({ length: 20 }, (_, i) => i + 1);
  let idx = 0;

  for (const user of users) {
    const num = idx < 20 ? pool[idx] : Math.ceil(Math.random() * 20);
    user.avatarUrl = `/images/avatars/avatar-${num}.jpg`;
    await user.save();
    console.log(`${user.name} → avatar-${num}.jpg`);
    idx++;
  }

  console.log('Done');
  await mongoose.disconnect();
}

run().catch(console.error);
