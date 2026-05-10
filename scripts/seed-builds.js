require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Part = require('../models/Part');
const PrebuiltBuild = require('../models/PrebuiltBuild');

async function seedBuilds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch all parts indexed by name for easy lookup
    const allParts = await Part.find({}).lean();
    const byName = {};
    allParts.forEach(p => { byName[p.name] = p; });

    function id(name) {
      const p = byName[name];
      if (!p) { console.warn(`WARNING: Part not found: "${name}"`); return null; }
      return p._id;
    }

    const builds = [
      {
        name: 'Ghost Recon Mk.II',
        description: 'Long-range reconnaissance build. Whisper-quiet motors, encrypted FPV link, and a 4K stabilised gimbal.',
        imageUrl: '/images/models/model1.png',
        specChips: ['5" Frame', '2306 Motors', '4S LiPo', '~28 min'],
        parts: [
          { partId: id('Aero-Spec 5" Racing Frame'),        quantity: 1 },
          { partId: id('Pro-Stealth 2207 Blackout'),        quantity: 4 },
          { partId: id('CineSmooth 5×3 Tri-Blade'),         quantity: 1 },
          { partId: id('Aero-Spec Smart Pack 4S'),          quantity: 1 },
          { partId: id('LongRange H7 ELRS FC'),             quantity: 1 },
          { partId: id('NightHawk Starlight Cam'),          quantity: 1 },
          { partId: id('Volt-Tower 45A Stacked ESC'),       quantity: 1 },
          { partId: id('Aero-Spec Carbon TX'),              quantity: 1 },
        ]
      },
      {
        name: 'Vanguard Interceptor',
        description: 'Agile indoor interceptor. Screams through gates at 140 km/h with sub-30ms latency video.',
        imageUrl: '/images/models/model2.png',
        specChips: ['3" Micro', '1404 Motors', '3S LiHV', '~18 min'],
        parts: [
          { partId: id('Deep-Sea 125 Micro Frame'),         quantity: 1 },
          { partId: id('High-Viz 2306 Transparent'),        quantity: 4 },
          { partId: id('GoldRush 5×4.5 Tri-Blade'),         quantity: 1 },
          { partId: id('Competition 6S Race Pack'),         quantity: 1 },
          { partId: id('Nano Shield Micro FC'),             quantity: 1 },
          { partId: id('GoldEye Analog FPV Cam'),           quantity: 1 },
          { partId: id('Aero-Spec 50A 4-in-1 ESC'),        quantity: 1 },
          { partId: id('Volt-Link 45A Silver TX'),          quantity: 1 },
        ]
      },
      {
        name: 'Titan Hauler X',
        description: 'Heavy-lift platform. Carries payloads up to 2kg with rock-solid stability in 40 km/h crosswinds.',
        imageUrl: '/images/models/model3.png',
        specChips: ['7" Frame', '2812 Motors', '6S LiPo', '~35 min'],
        parts: [
          { partId: id('Ultralight Long-Range Frame'),      quantity: 1 },
          { partId: id('Deep-Sea 3110 Heavy Lift'),         quantity: 4 },
          { partId: id('Carbon Hex 5" 6-Blade'),            quantity: 1 },
          { partId: id('Aero-Spec 5000mAh 6S'),            quantity: 1 },
          { partId: id('Pro-Stealth Armored FC'),           quantity: 1 },
          { partId: id('TriVision Multi-Sensor Cam'),       quantity: 1 },
          { partId: id('BLHeli_32 45A Aluminum ESC'),       quantity: 1 },
          { partId: id('Volt-Power 45A Tactical TX'),       quantity: 1 },
        ]
      },
      {
        name: 'Shadow Strike Pro',
        description: 'High-speed racing build. Tuned for precision gates, with low-drag carbon arms and 60A ESC stack.',
        imageUrl: '/images/models/model4.png',
        specChips: ['6" Frame', '2507 Motors', '5S LiPo', '~22 min'],
        parts: [
          { partId: id('Pro-Stealth Freestyle Frame'),      quantity: 1 },
          { partId: id('Aero-Spec 2207 2300KV'),            quantity: 4 },
          { partId: id('GoldRush 5×4.5 Tri-Blade'),         quantity: 1 },
          { partId: id('Competition 6S Race Pack'),         quantity: 1 },
          { partId: id('Aero-Spec F7 Stack FC'),            quantity: 1 },
          { partId: id('Spectra Wide FPV Cam'),             quantity: 1 },
          { partId: id('Volt-Tower 45A Stacked ESC'),       quantity: 1 },
          { partId: id('H1-Tech Transparent TX'),           quantity: 1 },
        ]
      }
    ];

    // Compute total price per build
    for (const build of builds) {
      build.parts = build.parts.filter(p => p.partId); // drop missing parts
      const partIds = build.parts.map(p => p.partId);
      const dbParts = await Part.find({ _id: { $in: partIds } }).lean();
      const priceMap = {};
      dbParts.forEach(p => { priceMap[p._id.toString()] = p.price; });
      build.totalPrice = build.parts.reduce((sum, p) => sum + (priceMap[p.partId.toString()] || 0) * p.quantity, 0);
    }

    await PrebuiltBuild.deleteMany({});
    console.log('Cleared existing prebuilt builds');

    const inserted = await PrebuiltBuild.insertMany(builds);
    console.log(`Seeded ${inserted.length} prebuilt builds:`);
    inserted.forEach(b => console.log(`  • ${b.name}  $${b.totalPrice.toFixed(2)}`));

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedBuilds();
