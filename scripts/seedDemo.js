/**
 * DroneForge — Full Demo Seed Script
 * Creates: 1 admin, 5 users, parts catalog (all categories), 10 sample orders
 * Usage: node scripts/seedDemo.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User  = require('../models/User');
const Part  = require('../models/Part');
const Order = require('../models/Order');

const SALT = 12;

// ── Users ──────────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Admin Forge',    email: 'admin@droneforge.io', password: 'Admin@1234',  role: 'admin' },
  { name: 'Test Pilot',     email: 'pilot@droneforge.io', password: 'Pilot@1234',  role: 'user'  },
  { name: 'Zara Nakamura',  email: 'zara@example.io',     password: 'Test@1234',   role: 'user'  },
  { name: 'Marcus Osei',    email: 'marcus@example.io',   password: 'Test@1234',   role: 'user'  },
  { name: 'Lena Kovacs',    email: 'lena@example.io',     password: 'Test@1234',   role: 'user'  },
  { name: 'Tariq Rashid',   email: 'tariq@example.io',    password: 'Test@1234',   role: 'user'  },
];

// ── Parts (5 per category) ──────────────────────────────────────────────────
const PARTS = [
  // Frames
  { name:'Titan 5" Carbon Frame', category:'frame', price:89.99,  weight:85,  stock:50, description:'Lightweight 5-inch true-X carbon fiber freestyle frame. 4mm arms, 30x30 stack mount.',    imageUrl:'' },
  { name:'Ghost 3" Micro Frame',  category:'frame', price:42.50,  weight:32,  stock:40, description:'Ultra-light 3-inch micro frame with integrated camera protection cage.',                   imageUrl:'' },
  { name:'Vanguard 7" Stretch-X', category:'frame', price:129.00, weight:148, stock:25, description:'Long-range 7-inch stretched-X layout for maximum efficiency and top speed.',               imageUrl:'' },
  { name:'Fortress HD Frame',     category:'frame', price:79.99,  weight:112, stock:30, description:'Cinematic 5" frame with full DJI O3 integration cutout and 60° camera angle.',             imageUrl:'' },
  { name:'Nano Whoop 2.5"',       category:'frame', price:28.00,  weight:22,  stock:60, description:'Tiny ducted whoop frame for indoor proximity flying. Prop guards included.',               imageUrl:'' },

  // Motors
  { name:'Forge-X 2306 2450KV',   category:'motors', price:24.99, weight:28,  stock:80, description:'High-thrust freestyle motor with N52 magnets and 12N14P configuration.',                  imageUrl:'' },
  { name:'Stealth 1404 3800KV',   category:'motors', price:18.50, weight:14,  stock:70, description:'Micro motor for 3" builds. Ceramic bearings, titanium shaft.',                             imageUrl:'' },
  { name:'Titan 2812 1200KV',     category:'motors', price:38.00, weight:52,  stock:35, description:'Heavy-lift 7" motor with 8mm shaft for payloads up to 500g per motor.',                   imageUrl:'' },
  { name:'Precision 2207 1750KV', category:'motors', price:22.00, weight:30,  stock:65, description:'Race-spec motor wound for efficiency. 95°C rated stator wire.',                            imageUrl:'' },
  { name:'Ghost 1103 8000KV',     category:'motors', price:12.99, weight:7,   stock:90, description:'Tiny whoop motor, brushless, 1103 stator. 2S compatible.',                                 imageUrl:'' },

  // Propellers
  { name:'5145 Tri-Blade Props',  category:'propellers', price:4.99,  weight:6,  stock:200, description:'5.1" aggressive tri-blade propellers for freestyle. Set of 4 (2CW+2CCW).',             imageUrl:'' },
  { name:'3024 Micro Props',      category:'propellers', price:3.50,  weight:3,  stock:150, description:'3-inch dual-blade for micro quads. Ultra-light polycarbonate.',                         imageUrl:'' },
  { name:'7035 Efficiency Bi',    category:'propellers', price:9.99,  weight:18, stock:80,  description:'7-inch long-range bi-blade optimised for 12+ minute flights.',                          imageUrl:'' },
  { name:'4922 HQ Props',         category:'propellers', price:6.50,  weight:8,  stock:120, description:'4.9" cinema-smooth propellers, low vibration at mid throttle.',                         imageUrl:'' },
  { name:'2530 Toothpick Props',  category:'propellers', price:2.99,  weight:2,  stock:200, description:'2.5" nano whoop compatible 3-blade. Shock-resistant.',                                  imageUrl:'' },

  // Battery
  { name:'4S 1500mAh LiPo',       category:'battery', price:34.99, weight:175, stock:45, description:'4S 100C LiPo for freestyle 5" builds. XT60 connector, 15-min avg flight time.',         imageUrl:'' },
  { name:'3S 650mAh LiHV',        category:'battery', price:18.00, weight:65,  stock:55, description:'3S LiHV pack for micro quads. 4.35V per cell max, ultra-light.',                         imageUrl:'' },
  { name:'6S 2200mAh LiPo',       category:'battery', price:64.99, weight:310, stock:20, description:'6S pack for 7" long-range rigs. 75C burst. Anti-spark XT90 plug.',                       imageUrl:'' },
  { name:'4S 850mAh Nano',        category:'battery', price:22.50, weight:118, stock:40, description:'Lightweight 4S pack for 3" and toothpick builds.',                                        imageUrl:'' },
  { name:'2S 300mAh HV',          category:'battery', price:9.99,  weight:28,  stock:100, description:'2S HV for nano whoops. JST-PH 2.0 connector.',                                          imageUrl:'' },

  // Flight Controller
  { name:'Forge FC F7 AIO',        category:'flightController', price:69.99, weight:9,  stock:35, description:'F7 all-in-one FC with integrated 4-in-1 ESC, BEC, and OSD. 30x30 stack.',      imageUrl:'' },
  { name:'Stealth F4 Stack',       category:'flightController', price:44.99, weight:7,  stock:50, description:'F4 FC + 35A 4-in-1 ESC stack. Supports ELRS/Crossfire.',                        imageUrl:'' },
  { name:'Nano F4 20x20',          category:'flightController', price:29.99, weight:4,  stock:60, description:'Ultra-compact 20x20 F4 AIO for micro quads. BLE configurator.',                 imageUrl:'' },
  { name:'Apex H7 Race FC',        category:'flightController', price:89.00, weight:11, stock:20, description:'H7 dual-gyro race FC. 32kHz loop, blackbox 2GB, barometer.',                    imageUrl:'' },
  { name:'Toothpick AIO F4',       category:'flightController', price:24.99, weight:3,  stock:70, description:'25.5x25.5mm F4 + 12A ESC AIO. Ideal for 2.5" builds.',                          imageUrl:'' },

  // Camera
  { name:'Nebula Pro HD Camera',   category:'camera', price:79.99, weight:28, stock:30, description:'1080p60 digital FPV camera with 2.1mm wide lens and WDR sensor.',                        imageUrl:'' },
  { name:'Runcam Phoenix 2',       category:'camera', price:34.99, weight:22, stock:45, description:'Analog 1200TVL FPV camera. 6ms latency, starlight mode.',                                 imageUrl:'' },
  { name:'4K Naked GoPro Mod',     category:'camera', price:149.00, weight:35, stock:15, description:'Stripped GoPro 10 board with custom mount. Cinematic 4K60 footage.',                     imageUrl:'' },
  { name:'Nano Cam 1200TVL',       category:'camera', price:18.00, weight:8,  stock:80, description:'Super-compact 9x9mm analog cam for nano whoops.',                                         imageUrl:'' },
  { name:'Walksnail Avatar Cam',   category:'camera', price:119.00, weight:30, stock:25, description:'Walksnail HD digital FPV camera, 1080p, ultra-low latency link.',                        imageUrl:'' },

  // ESC
  { name:'Blaze 45A 4-in-1 ESC',  category:'ESC', price:49.99, weight:14, stock:40, description:'4-in-1 BLHeli_32 45A ESC. DSHOT600 / Multishot. 2-6S.',                                     imageUrl:'' },
  { name:'Sprint 35A 4-in-1',     category:'ESC', price:36.00, weight:11, stock:55, description:'4-in-1 35A AM32 open-source ESC. Telemetry support.',                                         imageUrl:'' },
  { name:'Nano 12A 4-in-1',       category:'ESC', price:22.99, weight:4,  stock:70, description:'Ultra-light 12A 4-in-1 for micro quads. 2-4S, 20x20 mount.',                                 imageUrl:'' },
  { name:'Titan 80A Single ESC',  category:'ESC', price:18.00, weight:16, stock:30, description:'Single 80A ESC for heavy-lift motors. Bullet 45 connectors.',                                 imageUrl:'' },
  { name:'Race 60A 4-in-1',       category:'ESC', price:62.00, weight:16, stock:20, description:'Competition-grade 60A BLHeli_32. 3-6S, FET temp limiting.',                                   imageUrl:'' },

  // Transmitter
  { name:'ELRS 2.4GHz TX Module', category:'transmitter', price:39.99, weight:55,  stock:40, description:'ExpressLRS 2.4GHz long-range radio module. Up to 1W output, 4ms latency.',          imageUrl:'' },
  { name:'Nano ELRS RX 915MHz',   category:'transmitter', price:14.99, weight:2,   stock:80, description:'Tiny ELRS receiver, 0.1g ceramic antenna. 915MHz penetration mode.',                 imageUrl:'' },
  { name:'FrSky R9M 2019',        category:'transmitter', price:54.00, weight:62,  stock:25, description:'FrSky 900MHz long-range TX module. 2km reliable range on stock antenna.',            imageUrl:'' },
  { name:'TBS Crossfire Nano RX', category:'transmitter', price:24.99, weight:3,   stock:50, description:'TBS Crossfire nano receiver for extreme range builds.',                               imageUrl:'' },
  { name:'RadioMaster Pocket TX', category:'transmitter', price:89.00, weight:220, stock:20, description:'Full standalone TX with ELRS built-in. EdgeTX, Hall gimbals, 16 channels.',          imageUrl:'' },
];

// ── Orders (10 sample) ─────────────────────────────────────────────────────
const STATUSES = ['pending','confirmed','shipped','delivered','cancelled'];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected\n');

  // Users
  const userDocs = [];
  for (const u of USERS) {
    let doc = await User.findOne({ email: u.email });
    if (!doc) {
      const passwordHash = await bcrypt.hash(u.password, SALT);
      doc = await User.create({ name: u.name, email: u.email, passwordHash, role: u.role, isActive: true });
      console.log(`  ✓ Created ${u.role}: ${u.email}`);
    } else {
      console.log(`  – Exists:  ${u.email}`);
    }
    userDocs.push(doc);
  }

  // Parts
  let partDocs = [];
  const existingCount = await Part.countDocuments();
  if (existingCount < PARTS.length) {
    await Part.deleteMany({});
    partDocs = await Part.insertMany(PARTS);
    console.log(`\n  ✓ Seeded ${partDocs.length} parts`);
  } else {
    partDocs = await Part.find();
    console.log(`\n  – Parts already seeded (${partDocs.length})`);
  }

  // Orders
  const existingOrders = await Order.countDocuments();
  if (existingOrders < 10) {
    const regularUsers = userDocs.filter(u => u.role === 'user');
    const buildNames = ['Ghost Recon Mk.II','Vanguard Interceptor','Titan Hauler X','Nebula Scout','Phantom Racer','Stealth Micro','Apex Cinema Rig','Storm Chaser v3','Reaper X','Midnight Runner'];
    const shippingMethods = ['priority','standard'];
    for (let i = 0; i < 10; i++) {
      const user   = regularUsers[i % regularUsers.length];
      const p1     = partDocs[i * 3 % partDocs.length];
      const p2     = partDocs[(i * 3 + 1) % partDocs.length];
      const method = shippingMethods[i % 2];
      const shippingCost = method === 'priority' ? 45 : 0;
      const subtotal = p1.price + p2.price * 2;
      const tax = parseFloat((subtotal * 0.08).toFixed(2));
      const total = parseFloat((subtotal + tax + shippingCost).toFixed(2));
      await Order.create({
        userId: user._id,
        buildName: buildNames[i],
        parts: [
          { partId: p1._id, name: p1.name, category: p1.category, imageUrl: p1.imageUrl, quantity: 1, priceAtOrder: p1.price },
          { partId: p2._id, name: p2.name, category: p2.category, imageUrl: p2.imageUrl, quantity: 2, priceAtOrder: p2.price },
        ],
        totalPrice: total,
        shippingMethod: method,
        shippingCost,
        tax,
        shippingAddress: {
          fullName: user.name,
          email: user.email,
          address: `${100 + i * 7} Forge Street`,
          city: ['Karachi','London','Dubai','Berlin','Tokyo'][i % 5],
          state: ['Sindh','England','Dubai','Bavaria','Tokyo'][i % 5],
          zip: String(10000 + i * 111),
          country: 'PK',
        },
        status: STATUSES[i % STATUSES.length],
        createdAt: new Date(Date.now() - i * 86400000 * 3),
      });
    }
    console.log('  ✓ Seeded 10 sample orders');
  } else {
    console.log(`  – Orders already seeded (${existingOrders})`);
  }

  await mongoose.disconnect();
  console.log('\nSeed complete.');
}

seed().catch(err => { console.error(err); process.exit(1); });
