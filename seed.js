require('dotenv').config();
const mongoose = require('mongoose');
const Part = require('./models/Part');

const parts = [
  // ── FRAMES ──
  { name: 'QuantumX 5" FPV Frame', category: 'frame', price: 49.99, weight: 82, description: 'Ultra-stiff 3K carbon fiber unibody frame optimized for 5-inch freestyle builds. Armored motor protection and seamless GoPro mounting.', imageUrl: '/images/fpv-drone.jpg', specs: { material: 'Carbon Fiber 3K', motorMounting: '16×16mm / 30.5×30.5mm', topPlateThickness: '2mm', bottomPlateThickness: '3mm', propSize: '5 inch', weight: '82g' }, stock: 25 },
  { name: 'TitanFrame X7 Long Range', category: 'frame', price: 89.99, weight: 185, description: 'Expedition-grade aluminum-reinforced carbon frame built for 7-inch long-range builds. Integrated battery strap channels and vibration dampers.', imageUrl: '/images/drone-bg.jpg', specs: { material: 'Carbon Fiber + 7075 Aluminum', motorMounting: '25×25mm', wheelbase: '315mm', propSize: '7 inch', weight: '185g' }, stock: 15 },
  { name: 'NanoForge 3" Micro Frame', category: 'frame', price: 24.99, weight: 34, description: 'Featherweight micro-racer frame for indoor flight and proximity racing. Incredible strength-to-weight ratio.', imageUrl: '/images/drone-illustration.png', specs: { material: 'Carbon Fiber', propSize: '3 inch', motorMounting: '12×12mm', weight: '34g' }, stock: 40 },
  { name: 'HeavyLift Pro Frame', category: 'frame', price: 149.99, weight: 380, description: 'Hexacopter-grade platform for commercial payload delivery. Expandable arm system supports payloads up to 5kg.', imageUrl: '/images/drone-bg.jpg', specs: { material: 'Carbon + G10 Fiberglass', configuration: 'X6 Hex', maxPayload: '5000g', motorMounting: '25×25mm', weight: '380g' }, stock: 8 },
  { name: 'Stealth Runner V2 Frame', category: 'frame', price: 67.99, weight: 110, description: 'Aerodynamically optimized 5" race frame with ultra-low profile and hidden wiring channels. Built for podium finishes.', imageUrl: '/images/fpv-drone.jpg', specs: { material: 'Toray T700 Carbon', wheelbase: '220mm', motorMounting: '16×16mm', armThickness: '4mm', weight: '110g' }, stock: 20 },

  // ── MOTORS ──
  { name: 'HyperSpin 2306 2450KV', category: 'motors', price: 22.99, weight: 32, description: 'High-torque stator wind with N52H magnets delivers screaming top speed for 5-inch freestyle builds.', imageUrl: '/images/aperture.gif', specs: { statorSize: '23×6mm', kv: '2450KV', maxThrust: '1250g', maxAmps: '35A', maxWatts: '510W', recommendedProp: '5 inch' }, stock: 60 },
  { name: 'TorqueMaster 2812 900KV', category: 'motors', price: 34.99, weight: 68, description: 'Long-range low-KV motor optimized for 7–10 inch propellers. Extended flight times with cool running temperature.', imageUrl: '/images/aperture.gif', specs: { statorSize: '28×12mm', kv: '900KV', maxThrust: '2200g', maxAmps: '28A', recommendedProp: '7–9 inch' }, stock: 35 },
  { name: 'NanoRip 1404 3800KV', category: 'motors', price: 16.99, weight: 14, description: 'Micro motor powerhouse for 3-inch builds. Weighs almost nothing but punches way above its class.', imageUrl: '/images/aperture.gif', specs: { statorSize: '14×4mm', kv: '3800KV', maxThrust: '420g', maxAmps: '16A', recommendedProp: '3 inch' }, stock: 80 },
  { name: 'ReaperX 2507 1950KV', category: 'motors', price: 28.99, weight: 41, description: 'Cinematic-smooth stator for 5-inch cine builds. Reduced vibration signature for crystal-clear footage.', imageUrl: '/images/aperture.gif', specs: { statorSize: '25×7mm', kv: '1950KV', maxThrust: '1380g', maxAmps: '32A', recommendedProp: '5 inch cinematic' }, stock: 45 },
  { name: 'OmegaDrive 3115 1600KV', category: 'motors', price: 42.99, weight: 92, description: 'Heavy-lift motor for hexacopter and payload builds. Laminated stator for maximum efficiency and thermal dissipation.', imageUrl: '/images/aperture.gif', specs: { statorSize: '31×15mm', kv: '1600KV', maxThrust: '2900g', maxAmps: '40A', recommendedProp: '8–10 inch' }, stock: 28 },

  // ── PROPELLERS ──
  { name: 'HQProp 5.1×4.1×3 Tri-Blade', category: 'propellers', price: 4.99, weight: 8, description: 'Industry-standard freestyle propeller with exceptional durability and linear power delivery. Available in pairs.', imageUrl: '/images/drone-lineal.gif', specs: { diameter: '5.1 inch', pitch: '4.1 inch', blades: '3', material: 'Polycarbonate', color: 'Black / Blue' }, stock: 200 },
  { name: 'GemFan 7042 Long-Range', category: 'propellers', price: 7.99, weight: 18, description: 'Ultra-efficient 7-inch cruising prop optimized for maximum range at moderate throttle.', imageUrl: '/images/drone-lineal.gif', specs: { diameter: '7 inch', pitch: '4.2 inch', blades: '2', material: 'Nylon glass fiber', efficiency: 'High' }, stock: 120 },
  { name: 'T-Motor P3×3 Carbon', category: 'propellers', price: 12.99, weight: 6, description: 'Premium carbon fiber micro prop for 3-inch builds. Near-zero flex ensures consistent thrust curves.', imageUrl: '/images/drone-lineal.gif', specs: { diameter: '3 inch', pitch: '3 inch', blades: '2', material: 'Carbon Fiber', weight: '6g pair' }, stock: 150 },
  { name: 'CineWhoop 3×2.5 Ducted', category: 'propellers', price: 5.99, weight: 10, description: 'Specially designed for ducted duct-protected setups. Lower noise signature and improved safety.', imageUrl: '/images/drone-lineal.gif', specs: { diameter: '3 inch', pitch: '2.5 inch', blades: '2', type: 'Ducted', noiseRated: 'Low' }, stock: 90 },
  { name: 'HQProp 10×4.5 Heavy Lift', category: 'propellers', price: 9.99, weight: 38, description: 'High-pitch commercial-grade propeller for maximum thrust in heavy-payload applications.', imageUrl: '/images/drone-lineal.gif', specs: { diameter: '10 inch', pitch: '4.5 inch', blades: '2', material: 'Reinforced Nylon', application: 'Payload delivery' }, stock: 60 },

  // ── BATTERIES ──
  { name: 'GNB 1500mAh 6S 120C', category: 'battery', price: 64.99, weight: 185, description: 'High-discharge racing pack for 5-inch freestyle. Punchy power delivery with minimal voltage sag.', imageUrl: '/images/drone-gif.gif', specs: { capacity: '1500mAh', cells: '6S', cRating: '120C', voltage: '22.2V nominal', connector: 'XT60', weight: '185g' }, stock: 30 },
  { name: 'CNHL 4000mAh 4S 60C', category: 'battery', price: 48.99, weight: 365, description: 'Long-range cruiser pack for 7-inch builds. 4000mAh capacity ensures 20+ minute flight times.', imageUrl: '/images/drone-gif.gif', specs: { capacity: '4000mAh', cells: '4S', cRating: '60C', voltage: '14.8V nominal', connector: 'XT90', weight: '365g' }, stock: 20 },
  { name: 'Tattu R-Line 650mAh 6S 150C', category: 'battery', price: 39.99, weight: 95, description: 'Elite competition pack. Featherweight for race-day performance at full throttle bursts.', imageUrl: '/images/drone-gif.gif', specs: { capacity: '650mAh', cells: '6S', cRating: '150C', connector: 'XT30', weight: '95g' }, stock: 50 },
  { name: 'CNHL 450mAh 1S Micro', category: 'battery', price: 8.99, weight: 26, description: 'Compact 1S pack for micro builds. High-energy-density cells with integrated PH2.0 connector.', imageUrl: '/images/drone-gif.gif', specs: { capacity: '450mAh', cells: '1S', cRating: '90C', connector: 'PH2.0 / BT2.0', weight: '26g' }, stock: 100 },
  { name: 'Smart Battery 22000mAh 6S', category: 'battery', price: 299.99, weight: 2100, description: 'Commercial-grade intelligent battery with on-board BMS, charge monitoring, and cell balancing display.', imageUrl: '/images/drone-gif.gif', specs: { capacity: '22000mAh', cells: '6S', cRating: '10C', connector: 'AS150 + XT60', BMS: 'Integrated', weight: '2100g' }, stock: 5 },

  // ── FLIGHT CONTROLLERS ──
  { name: 'Betaflight F7 AIO FC', category: 'flightController', price: 54.99, weight: 9, description: 'F7 processor with Betaflight-ready firmware. Onboard barometer, SD card black box, and dual gyros for maximum tune precision.', imageUrl: '/images/drone-hd.gif', specs: { processor: 'F7 (216MHz)', gyro: 'ICM42688-P dual', blackbox: 'SD Card', OSD: 'Integrated', baro: 'Yes', mounting: '30.5×30.5mm' }, stock: 25 },
  { name: 'Kakute H7 V2 FC', category: 'flightController', price: 67.99, weight: 10, description: 'H7 processor flight controller with ELRS-ready UART and 8 PWM outputs. Perfect for freestyle and long-range.', imageUrl: '/images/drone-hd.gif', specs: { processor: 'H7 (480MHz)', UARTs: '8', ESC_connector: 'JST-SH', OSD: 'Betaflight OSD', blackbox: '1MB flash + SD', mounting: '30.5×30.5mm' }, stock: 18 },
  { name: 'Pixhawk 6C Autopilot', category: 'flightController', price: 189.99, weight: 36, description: 'Professional-grade PX4/ArduPilot autopilot for autonomous missions. Triple IMU redundancy and GPS-L1/L5 support.', imageUrl: '/images/drone-hd.gif', specs: { processor: 'STM32H753', IMUs: '3× ICM-20689', GPS: 'L1/L5 dual band', interfaces: 'CAN, I2C, SPI, UART, USB-C', mounting: '38.1×38.1mm' }, stock: 10 },
  { name: 'Speedy Bee F405 Mini', category: 'flightController', price: 39.99, weight: 7, description: 'Budget champion FC for micro and 3-inch builds. Bluetooth configurator app for wireless tuning.', imageUrl: '/images/drone-hd.gif', specs: { processor: 'F405', gyro: 'MPU6000', bluetooth: 'Configurator app', OSD: 'Betaflight', mounting: '20×20mm' }, stock: 35 },
  { name: 'Matek F765-SE FC', category: 'flightController', price: 79.99, weight: 15, description: 'Feature-rich dual-gyro FC with built-in VTX pit mode, SD card, and 8 UARTs for complex long-range setups.', imageUrl: '/images/drone-hd.gif', specs: { processor: 'F765', UARTs: '8', builtinVTX: 'Pit mode 25mW', SDcard: 'Yes', baro: 'DPS310', OSD: 'Max7456' }, stock: 14 },

  // ── CAMERAS ──
  { name: 'Runcam Phoenix 2 FPV Cam', category: 'camera', price: 34.99, weight: 21, description: 'Low-latency analog FPV camera with WDR and starlight sensor. Crisp image in all lighting conditions.', imageUrl: '/images/drone-fly.gif', specs: { resolution: '1200TVL', sensor: 'IMX225', FOV: '155°', latency: '<5ms', format: 'NTSC/PAL', voltage: '5–40V' }, stock: 40 },
  { name: 'Walksnail Avatar HD Mini', category: 'camera', price: 89.99, weight: 23, description: 'Digital HD FPV camera module for the Avatar system. 1080p/60fps feed with sub-30ms latency.', imageUrl: '/images/drone-fly.gif', specs: { resolution: '1080p 60fps', latency: '<28ms', FOV: '150°', system: 'Avatar', connector: 'MIPI', weight: '23g' }, stock: 22 },
  { name: 'GoPro Hero 12 Black', category: 'camera', price: 299.99, weight: 153, description: 'Cinematic 5.3K action cam with HyperSmooth 6.0 stabilization. The gold standard for aerial cinematography.', imageUrl: '/images/drone-fly.gif', specs: { resolution: '5.3K 60fps', stabilization: 'HyperSmooth 6.0', lens: 'Waterproof to 10m', battery: 'Enduro 1720mAh', weight: '153g' }, stock: 12 },
  { name: 'Naked GoPro Hero 10', category: 'camera', price: 189.99, weight: 38, description: 'Factory-stripped GoPro board with minimal casing removed. 75% lighter than the stock unit for racing builds.', imageUrl: '/images/drone-fly.gif', specs: { resolution: '5.3K', stabilization: 'HyperSmooth 4.0', weight: '38g stripped', FOV: 'Linear/Superview' }, stock: 8 },
  { name: 'Caddx Polar Starlight Analog', category: 'camera', price: 27.99, weight: 18, description: 'Budget-friendly FPV cam with exceptional low-light performance. Solid choice for night flying sessions.', imageUrl: '/images/drone-fly.gif', specs: { resolution: '1200TVL', sensor: 'Sony Starlight', FOV: '160°', latency: '<5ms', weight: '18g' }, stock: 55 },

  // ── ESC ──
  { name: 'Aikon AK32 4-in-1 ESC 45A', category: 'ESC', price: 44.99, weight: 16, description: 'BLHeli_32 4-in-1 ESC rated at 45A continuous per output. Bidirectional DSHOT for RPM filter support.', imageUrl: '/images/drone-hd.gif', specs: { current: '45A continuous / 55A burst', protocol: 'DSHOT300/600/1200', bidir: 'Yes', telemetry: 'Yes', mounting: '30.5×30.5mm', weight: '16g' }, stock: 30 },
  { name: 'Hobbywing XRotor 60A 4-in-1', category: 'ESC', price: 69.99, weight: 22, description: 'High-current racing ESC for demanding freestyle setups. Active freewheeling and real-time current telemetry.', imageUrl: '/images/drone-hd.gif', specs: { current: '60A continuous', protocol: 'DSHOT1200', bidir: 'Yes', current_sensor: 'Yes', mounting: '30.5×30.5mm', cells: '3–6S' }, stock: 18 },
  { name: 'T-Motor F55A Pro II ESC', category: 'ESC', price: 79.99, weight: 18, description: 'Premium ESC stack pair with F7 flight controller. Whisper-quiet operation with anti-desync firmware.', imageUrl: '/images/drone-hd.gif', specs: { current: '55A', protocol: 'DSHOT600', firmware: 'BLHeli_32', telemetry: 'ESC telemetry', mounting: '30.5×30.5mm' }, stock: 12 },
  { name: 'BLHeli_S 20A 4-in-1 Micro', category: 'ESC', price: 19.99, weight: 7, description: 'Compact 4-in-1 for micro and 3-inch builds. DSHOT300 support with bidirectional capability.', imageUrl: '/images/drone-hd.gif', specs: { current: '20A continuous / 25A burst', protocol: 'DSHOT300', cells: '2–4S', mounting: '20×20mm', weight: '7g' }, stock: 50 },
  { name: 'Mamba Stack 45A 6S ESC', category: 'ESC', price: 54.99, weight: 19, description: 'Paired stack for 5-inch 6S performance builds. Flat design minimizes build height for more aerodynamic profiles.', imageUrl: '/images/drone-hd.gif', specs: { current: '45A / 55A burst', cells: '3–6S', protocol: 'DSHOT600', bidir: 'Yes', mounting: '30.5×30.5mm' }, stock: 20 },

  // ── TRANSMITTERS ──
  { name: 'RadioMaster Boxer ELRS', category: 'transmitter', price: 149.99, weight: 498, description: 'Compact hall-effect gimbals transmitter with built-in ExpressLRS 2.4GHz module. Ideal for everyday freestyle and racing.', imageUrl: '/images/drone-race.gif', specs: { protocol: 'ELRS 2.4GHz', gimbals: 'Hall-effect', battery: '18650 ×2', screen: '480×272 color', weight: '498g' }, stock: 15 },
  { name: 'TBS Tango 2 Pro', category: 'transmitter', price: 199.99, weight: 355, description: 'Palm-sized race transmitter with TBS Crossfire built-in. Compact enough to stow in a jersey pocket.', imageUrl: '/images/drone-race.gif', specs: { protocol: 'Crossfire 900MHz', gimbals: 'Hall-effect', battery: 'Built-in 2500mAh', range: '40km+ LOS', weight: '355g' }, stock: 10 },
  { name: 'Jumper T20 ELRS', category: 'transmitter', price: 119.99, weight: 530, description: 'Full-size mode-switchable transmitter with ELRS and internal module bay. Feature-packed for the budget-conscious pilot.', imageUrl: '/images/drone-race.gif', specs: { protocol: 'ELRS 2.4GHz', modes: 'Mode 1/2/3/4 switchable', battery: '18650 ×2', weight: '530g' }, stock: 22 },
  { name: 'FrSky Taranis X9D Plus', category: 'transmitter', price: 179.99, weight: 862, description: 'The legendary OpenTX transmitter for precision tuning and deep customization. Industry workhorse with SD card telemetry logging.', imageUrl: '/images/drone-race.gif', specs: { protocol: 'ACCESS/FCC D16', gimbals: 'Hall-effect', battery: '18650 ×2 / 6000mAh', SD: 'Yes', weight: '862g' }, stock: 8 },
  { name: 'RadioMaster Pocket ELRS', category: 'transmitter', price: 79.99, weight: 245, description: 'Ultra-compact micro transmitter for cinewhoops and micro builds. Fits in any bag or pocket for grab-and-go flying.', imageUrl: '/images/drone-race.gif', specs: { protocol: 'ELRS 2.4GHz', size: 'Nano (160×80mm)', battery: '18650 ×1', gimbals: 'Hall-effect', weight: '245g' }, stock: 30 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Part.deleteMany({});
    console.log('Cleared existing parts');

    const inserted = await Part.insertMany(parts);
    console.log(`Seeded ${inserted.length} parts across 8 categories`);

    await mongoose.disconnect();
    console.log('Done. Disconnect.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
