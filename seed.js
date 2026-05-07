require('dotenv').config();
const mongoose = require('mongoose');
const Part = require('./models/Part');

const parts = [
  // ── FRAMES ──
  {
    name: 'Aero-Spec 5" Racing Frame',
    category: 'frame', price: 59.99, weight: 95,
    description: 'Precision-cut 3K carbon fiber X-frame built for competitive 5-inch freestyle. Gold-branded top plate with 30.5×30.5mm stack mounting.',
    imageUrl: '/images/parts/frame/1.jpg',
    specs: { material: 'Carbon Fiber 3K', wheelbase: '220mm', motorMounting: '16×16mm / 30.5×30.5mm', bottomPlateThickness: '3mm', propSize: '5 inch', weight: '95g' },
    stock: 25
  },
  {
    name: 'Ultralight Long-Range Frame',
    category: 'frame', price: 74.99, weight: 118,
    description: 'Weight-optimized X-frame with strategic material cutouts. Ideal for 7-inch long-range cruising builds with extended flight times.',
    imageUrl: '/images/parts/frame/2.jpg',
    specs: { material: 'Carbon Fiber T700', wheelbase: '310mm', motorMounting: '25×25mm', propSize: '7 inch', weight: '118g' },
    stock: 18
  },
  {
    name: 'Deep-Sea 125 Micro Frame',
    category: 'frame', price: 29.99, weight: 42,
    description: 'Compact 3-inch micro frame with integrated prop guards. Corrosion-resistant coating and reinforced arm joints for indoor and proximity flying.',
    imageUrl: '/images/parts/frame/3.jpg',
    specs: { material: 'G10 Composite', propSize: '3 inch', motorMounting: '12×12mm', propGuards: 'Integrated', weight: '42g' },
    stock: 40
  },
  {
    name: 'CineForge X Extended Frame',
    category: 'frame', price: 89.99, weight: 145,
    description: 'Extended-arm cinematic X-frame with front-mounted camera cradle and ribbed arm design for vibration dampening. Built for smooth aerial footage.',
    imageUrl: '/images/parts/frame/4.jpg',
    specs: { material: 'Carbon Fiber', wheelbase: '250mm', cameraMount: 'Front-integrated', motorMounting: '16×16mm', weight: '145g' },
    stock: 20
  },
  {
    name: 'High-Viz CineWhoop Frame',
    category: 'frame', price: 49.99, weight: 88,
    description: 'Semi-transparent ducted cinewhoop frame with fully enclosed propeller guards. Safe for indoor filming with pre-installed electronics tray.',
    imageUrl: '/images/parts/frame/5.jpg',
    specs: { material: 'Polycarbonate + Carbon', propSize: '3 inch', configuration: 'Ducted', ductMaterial: 'Clear PC', weight: '88g' },
    stock: 30
  },
  {
    name: 'Pro-Stealth Freestyle Frame',
    category: 'frame', price: 99.99, weight: 132,
    description: 'Aggressive low-profile X-frame with enclosed body shell and hidden wiring channels. Matte black finish for a stealthy competition-ready look.',
    imageUrl: '/images/parts/frame/6.jpg',
    specs: { material: 'Toray T700 Carbon', wheelbase: '230mm', motorMounting: '16×16mm', bodyEnclosure: 'Yes', weight: '132g' },
    stock: 15
  },

  // ── MOTORS ──
  {
    name: 'Aero-Spec 2207 2300KV',
    category: 'motors', price: 27.99, weight: 34,
    description: 'Carbon fiber wrapped stator with titanium base plate. N52H magnets and 2300KV winding deliver explosive thrust for 5-inch freestyle.',
    imageUrl: '/images/parts/motors/1.jpg',
    specs: { statorSize: '22×7mm', kv: '2300KV', maxThrust: '1300g', maxAmps: '38A', material: 'Carbon Fiber + Titanium', recommendedProp: '5 inch' },
    stock: 55
  },
  {
    name: 'Ultralight 230KV Long-Range',
    category: 'motors', price: 38.99, weight: 52,
    description: 'Open-stator aluminum motor with serialized 230KV low-KV winding. Engineered for maximum efficiency on 10–12 inch propellers during long-range missions.',
    imageUrl: '/images/parts/motors/2.jpg',
    specs: { statorSize: '40×10mm', kv: '230KV', maxThrust: '3500g', maxAmps: '25A', material: 'Aluminum alloy', recommendedProp: '10–12 inch' },
    stock: 28
  },
  {
    name: 'Deep-Sea 3110 Heavy Lift',
    category: 'motors', price: 54.99, weight: 115,
    description: 'Industrial-grade copper-alloy motor rated for deep-cycle heavy-lift applications. Corrosion-resistant housing and dual shaft bearings for payload drones.',
    imageUrl: '/images/parts/motors/3.jpg',
    specs: { statorSize: '31×10mm', kv: '400KV', maxThrust: '4200g', maxAmps: '45A', material: 'Copper alloy housing', recommendedProp: '12–15 inch' },
    stock: 12
  },
  {
    name: 'TorqueCore 4215 Integrated',
    category: 'motors', price: 64.99, weight: 98,
    description: 'Large-format motor with integrated multi-pin ESC connector for plug-and-play hexacopter builds. Finned stator for superior thermal management.',
    imageUrl: '/images/parts/motors/4.jpg',
    specs: { statorSize: '42×15mm', kv: '380KV', maxThrust: '5100g', maxAmps: '55A', connector: 'Integrated 12-pin', recommendedProp: '13–15 inch' },
    stock: 10
  },
  {
    name: 'High-Viz 2306 Transparent',
    category: 'motors', price: 34.99, weight: 38,
    description: 'Clear polycarbonate shell reveals the spinning stator internals during flight. Full-spec 2306 performance with a showpiece transparent housing.',
    imageUrl: '/images/parts/motors/5.jpg',
    specs: { statorSize: '23×6mm', kv: '2450KV', maxThrust: '1280g', maxAmps: '36A', housing: 'Clear Polycarbonate', recommendedProp: '5 inch' },
    stock: 35
  },
  {
    name: 'Pro-Stealth 2207 Blackout',
    category: 'motors', price: 29.99, weight: 33,
    description: 'All-matte-black stealthy motor with recessed branding. Low magnetic noise signature and anti-vibration base mount for smooth cinematic builds.',
    imageUrl: '/images/parts/motors/6.jpg',
    specs: { statorSize: '22×7mm', kv: '1950KV', maxThrust: '1200g', maxAmps: '32A', finish: 'Matte Black anodized', recommendedProp: '5 inch cine' },
    stock: 42
  },

  // ── PROPELLERS ──
  {
    name: 'Carbon Hex 5" 6-Blade',
    category: 'propellers', price: 18.99, weight: 14,
    description: 'Six-blade carbon fiber propeller for maximum static thrust at lower RPM. Ideal for heavy-lift and commercial payload builds requiring smooth, quiet operation.',
    imageUrl: '/images/parts/propellers/1.jpg',
    specs: { diameter: '5 inch', blades: '6', material: 'Carbon Fiber', application: 'Heavy-lift / Commercial', weight: '14g' },
    stock: 80
  },
  {
    name: 'GoldRush 5×4.5 Tri-Blade',
    category: 'propellers', price: 6.99, weight: 8,
    description: 'Translucent amber tri-blade with gold anodized hub. Aggressive 4.5-inch pitch delivers punchy freestyle performance with a distinctive look.',
    imageUrl: '/images/parts/propellers/2.jpg',
    specs: { diameter: '5 inch', pitch: '4.5 inch', blades: '3', material: 'Polycarbonate', color: 'Gold / Amber', weight: '8g' },
    stock: 150
  },
  {
    name: 'BronzeEdge 4×4 Quad-Blade',
    category: 'propellers', price: 9.99, weight: 16,
    description: 'Four-blade bronze-finish propeller with wide chord paddles. Produces high thrust with minimal vibration — great for camera drones.',
    imageUrl: '/images/parts/propellers/3.jpg',
    specs: { diameter: '4 inch', pitch: '4 inch', blades: '4', material: 'Reinforced Nylon', finish: 'Bronze', weight: '16g' },
    stock: 100
  },
  {
    name: 'BlueRing 64mm EDF Unit',
    category: 'propellers', price: 24.99, weight: 45,
    description: 'Electric ducted fan assembly in blue anodized aluminum ring. High-RPM 5-blade rotor provides jet-like thrust for speed-focused forward-flight builds.',
    imageUrl: '/images/parts/propellers/4.jpg',
    specs: { diameter: '64mm', blades: '5', housing: 'Anodized aluminum', type: 'EDF', color: 'Blue', weight: '45g' },
    stock: 40
  },
  {
    name: 'CineSmooth 5×3 Tri-Blade',
    category: 'propellers', price: 5.99, weight: 7,
    description: 'Amber translucent tri-blade with carbon fiber reinforced hub for cinematic builds. Low-pitch design minimizes vibration transfer to the airframe.',
    imageUrl: '/images/parts/propellers/5.jpg',
    specs: { diameter: '5 inch', pitch: '3 inch', blades: '3', material: 'PC + Carbon hub', type: 'Cinematic', weight: '7g' },
    stock: 120
  },
  {
    name: 'StealthDisc Shrouded Prop',
    category: 'propellers', price: 14.99, weight: 32,
    description: 'Fully shrouded multi-blade prop with hexagonal mesh guard. Reduces noise signature and prevents finger strikes — designed for safe proximity filming.',
    imageUrl: '/images/parts/propellers/6.jpg',
    specs: { diameter: '4 inch', blades: '6', housing: 'Mesh-guarded shroud', material: 'Nylon composite', noiseReduction: 'High', weight: '32g' },
    stock: 60
  },

  // ── BATTERIES ──
  {
    name: 'Aero-Spec 5000mAh 6S',
    category: 'battery', price: 79.99, weight: 420,
    description: 'Carbon fiber wrapped 6S racing pack with XT60 pads. Delivers consistent voltage under extreme 120C burst loads for all-out freestyle.',
    imageUrl: '/images/parts/battery/1.jpg',
    specs: { capacity: '5000mAh', cells: '6S', cRating: '120C', voltage: '22.2V nominal', connector: 'XT60', weight: '420g' },
    stock: 25
  },
  {
    name: 'Aero-Spec Smart Pack 4S',
    category: 'battery', price: 89.99, weight: 380,
    description: 'Brushed aluminum encased smart battery with multi-pin data connector. On-board firmware reports cell voltages, cycle count, and temperature.',
    imageUrl: '/images/parts/battery/2.jpg',
    specs: { capacity: '4000mAh', cells: '4S', cRating: '80C', voltage: '14.8V nominal', connector: '20-pin smart', BMS: 'Integrated', weight: '380g' },
    stock: 15
  },
  {
    name: 'Deep-Sea 12S Industrial Pack',
    category: 'battery', price: 249.99, weight: 1850,
    description: 'Heavy-duty 12S copper-alloy cased pack built for commercial and industrial platforms. Multi-port output with dedicated balance and main discharge connectors.',
    imageUrl: '/images/parts/battery/3.jpg',
    specs: { capacity: '12000mAh', cells: '12S', cRating: '20C', voltage: '44.4V nominal', ports: 'Multi-output', weight: '1850g' },
    stock: 6
  },
  {
    name: 'Competition 6S Race Pack',
    category: 'battery', price: 69.99, weight: 195,
    description: 'Armored matte-black racing battery with ribbed heat-sink housing. Built to withstand crash impacts while maintaining peak 150C discharge for race day.',
    imageUrl: '/images/parts/battery/4.jpg',
    specs: { capacity: '1300mAh', cells: '6S', cRating: '150C', voltage: '22.2V nominal', connector: 'XT60', weight: '195g' },
    stock: 40
  },
  {
    name: 'High-Viz 8S Transparent Pack',
    category: 'battery', price: 119.99, weight: 720,
    description: 'Clear polycarbonate shell reveals internal cell arrangement and BMS board. 8S configuration for high-voltage efficiency builds — watch your power in real time.',
    imageUrl: '/images/parts/battery/5.jpg',
    specs: { capacity: '6000mAh', cells: '8S', cRating: '60C', voltage: '29.6V nominal', housing: 'Clear PC', BMS: 'Visible integrated', weight: '720g' },
    stock: 10
  },
  {
    name: 'Fortress Dual-Fan Cooled Pack',
    category: 'battery', price: 159.99, weight: 890,
    description: 'High-capacity pack with twin active cooling fans for sustained discharge without thermal throttling. Designed for extended commercial missions.',
    imageUrl: '/images/parts/battery/6.jpg',
    specs: { capacity: '10000mAh', cells: '6S', cRating: '30C', voltage: '22.2V nominal', cooling: 'Dual active fans', weight: '890g' },
    stock: 8
  },

  // ── FLIGHT CONTROLLERS ──
  {
    name: 'Aero-Spec F7 Stack FC',
    category: 'flightController', price: 64.99, weight: 9,
    description: 'Green PCB F7 flight controller mounted on gold brass standoffs in a carbon fiber frame. Dual gyros, SD card blackbox, and onboard barometer.',
    imageUrl: '/images/parts/flightController/1.jpg',
    specs: { processor: 'STM32F7 (216MHz)', gyro: 'ICM42688-P dual', blackbox: 'SD Card', OSD: 'Integrated', baro: 'Yes', mounting: '30.5×30.5mm' },
    stock: 22
  },
  {
    name: 'Nano Shield Micro FC',
    category: 'flightController', price: 39.99, weight: 5,
    description: 'Ultra-compact FC with clear protective cover for micro and toothpick builds. Mounts inside aluminum frames with full Betaflight support.',
    imageUrl: '/images/parts/flightController/2.jpg',
    specs: { processor: 'STM32F405', gyro: 'MPU6000', OSD: 'Betaflight', mounting: '20×20mm', cover: 'Clear protective', weight: '5g' },
    stock: 35
  },
  {
    name: 'LongRange H7 ELRS FC',
    category: 'flightController', price: 84.99, weight: 14,
    description: 'Feature-packed H7 FC with built-in SMA antenna connector for VTX, 8 UARTs, and SD card slot. Purpose-built for long-range ELRS builds.',
    imageUrl: '/images/parts/flightController/3.jpg',
    specs: { processor: 'STM32H743 (480MHz)', UARTs: '8', antenna: 'SMA connector', blackbox: 'SD Card', mounting: '30.5×30.5mm', weight: '14g' },
    stock: 16
  },
  {
    name: 'AIO Vision FC + Camera',
    category: 'flightController', price: 109.99, weight: 22,
    description: 'All-in-one flight controller with integrated 40mm F4 FPV camera. Single-unit installation eliminates camera wiring and reduces build complexity.',
    imageUrl: '/images/parts/flightController/4.jpg',
    specs: { processor: 'F7', camera: '40mm F4 integrated', OSD: 'Betaflight', FOV: '165°', mounting: '30.5×30.5mm', weight: '22g' },
    stock: 18
  },
  {
    name: 'High-Viz FC Stack Transparent',
    category: 'flightController', price: 74.99, weight: 18,
    description: 'Clear acrylic encased flight controller and ESC stack. Full electrical access through the transparent shell — perfect for builders who want to showcase internals.',
    imageUrl: '/images/parts/flightController/5.jpg',
    specs: { processor: 'F7', housing: 'Clear Acrylic', includes: 'FC + PDB stack', mounting: '30.5×30.5mm', weight: '18g' },
    stock: 12
  },
  {
    name: 'Pro-Stealth Armored FC',
    category: 'flightController', price: 94.99, weight: 24,
    description: 'Sealed matte-black aluminum enclosure protects the flight controller from moisture, dust, and crash debris. Rated for all-weather and industrial operations.',
    imageUrl: '/images/parts/flightController/6.jpg',
    specs: { processor: 'H7', protection: 'IP54 sealed enclosure', material: 'Anodized aluminum', mounting: '38×38mm', weight: '24g' },
    stock: 10
  },

  // ── CAMERAS ──
  {
    name: 'Spectra Wide FPV Cam',
    category: 'camera', price: 42.99, weight: 22,
    description: 'Premium wide-angle FPV camera with multi-element coated glass lens. Purple-tinted anti-reflection coating delivers crisp, high-contrast analog video.',
    imageUrl: '/images/parts/camera/1.jpg',
    specs: { resolution: '1200TVL', sensor: 'CMOS', FOV: '165°', latency: '<5ms', lens: 'Multi-element coated glass', voltage: '5–36V' },
    stock: 38
  },
  {
    name: 'GoldEye Analog FPV Cam',
    category: 'camera', price: 29.99, weight: 18,
    description: 'Low-latency analog FPV camera with warm gold-coated single lens. Excellent dynamic range in bright conditions for racing and freestyle.',
    imageUrl: '/images/parts/camera/2.jpg',
    specs: { resolution: '1200TVL', sensor: 'IMX225', FOV: '150°', latency: '<5ms', format: 'NTSC/PAL', voltage: '5–40V' },
    stock: 50
  },
  {
    name: 'TriVision Multi-Sensor Cam',
    category: 'camera', price: 149.99, weight: 45,
    description: 'Three-lens multi-sensor array capturing wide, standard, and telephoto simultaneously. Ideal for inspection and mapping drones requiring multi-angle coverage.',
    imageUrl: '/images/parts/camera/3.jpg',
    specs: { lenses: '3× multi-focal', resolution: '4K per sensor', application: 'Inspection / Mapping', connector: 'MIPI ×3', weight: '45g' },
    stock: 10
  },
  {
    name: 'NightHawk Starlight Cam',
    category: 'camera', price: 64.99, weight: 24,
    description: 'Ultra-low-light camera with blue-coated wide-aperture lens and Sony Starlight sensor. Exceptional night visibility with minimal noise.',
    imageUrl: '/images/parts/camera/4.jpg',
    specs: { resolution: '1200TVL', sensor: 'Sony Starlight IMX327', FOV: '160°', minLux: '0.0001 lux', lens: 'Blue AR-coated', weight: '24g' },
    stock: 28
  },
  {
    name: 'High-Viz Naked Sensor Cam',
    category: 'camera', price: 189.99, weight: 36,
    description: 'Full-frame sensor exposed in clear polycarbonate housing for showcase builds. Stripped of outer casing to minimize weight while retaining full 4K capability.',
    imageUrl: '/images/parts/camera/5.jpg',
    specs: { resolution: '4K 60fps', sensor: 'Full-frame CMOS', housing: 'Clear PC', stabilization: 'Electronic', weight: '36g stripped' },
    stock: 8
  },
  {
    name: 'ArmorShield Rugged FPV Cam',
    category: 'camera', price: 54.99, weight: 30,
    description: 'Impact-resistant FPV camera with honeycomb mesh lens guard. Designed for proximity racing and urban freestyle where crashes are frequent.',
    imageUrl: '/images/parts/camera/6.jpg',
    specs: { resolution: '1080p', sensor: 'CMOS', FOV: '145°', protection: 'Mesh honeycomb guard', housing: 'Armored composite', weight: '30g' },
    stock: 30
  },

  // ── ESC ──
  {
    name: 'Aero-Spec 50A 4-in-1 ESC',
    category: 'ESC', price: 54.99, weight: 18,
    description: 'Carbon fiber and copper trace 4-in-1 ESC rated at 50A continuous. BLHeli_32 with bidirectional DSHOT and RPM telemetry support.',
    imageUrl: '/images/parts/ESC/1.jpg',
    specs: { current: '50A continuous / 60A burst', protocol: 'DSHOT600/1200', bidir: 'Yes', telemetry: 'RPM + current', mounting: '30.5×30.5mm', weight: '18g' },
    stock: 28
  },
  {
    name: 'BLHeli_32 45A Aluminum ESC',
    category: 'ESC', price: 79.99, weight: 28,
    description: 'CNC-machined aluminum cased 4-in-1 ESC with integrated heatsink fins. Heavy-duty construction for sustained 45A loads in demanding freestyle builds.',
    imageUrl: '/images/parts/ESC/2.jpg',
    specs: { current: '45A continuous', protocol: 'DSHOT600', firmware: 'BLHeli_32', housing: 'CNC Aluminum', cooling: 'Integrated fins', weight: '28g' },
    stock: 16
  },
  {
    name: 'Volt-Tower 45A Stacked ESC',
    category: 'ESC', price: 69.99, weight: 22,
    description: 'Dual-board stacked 4-in-1 ESC with copper heatspreader between layers. DSHOT1200 support and active freewheeling for razor-sharp motor response.',
    imageUrl: '/images/parts/ESC/3.jpg',
    specs: { current: '45A continuous / 55A burst', protocol: 'DSHOT1200', bidir: 'Yes', heatspreader: 'Copper', mounting: '30.5×30.5mm', weight: '22g' },
    stock: 20
  },
  {
    name: 'PowerCore 100A Single ESC',
    category: 'ESC', price: 44.99, weight: 14,
    description: 'Single-output 100A ESC for high-power individual motor control. Copper bus bars and thermal pad ensure reliable operation for industrial heavy-lift platforms.',
    imageUrl: '/images/parts/ESC/4.jpg',
    specs: { current: '100A continuous', protocol: 'DSHOT300/PWM', cells: '4–12S', thermalPad: 'Yes', connector: 'Gold bullet 4mm', weight: '14g' },
    stock: 22
  },
  {
    name: 'High-Viz Stack ESC Transparent',
    category: 'ESC', price: 64.99, weight: 20,
    description: 'Clear acrylic encased ESC stack matching the High-Viz FC. Exposes copper traces and capacitors for a showcase build with full performance.',
    imageUrl: '/images/parts/ESC/5.jpg',
    specs: { current: '45A per channel', protocol: 'DSHOT600', housing: 'Clear Acrylic', bidir: 'Yes', mounting: '30.5×30.5mm', weight: '20g' },
    stock: 12
  },
  {
    name: 'Pro-Stealth Compact ESC',
    category: 'ESC', price: 34.99, weight: 12,
    description: 'All-black minimal-profile single ESC with sealed enclosure. Runs whisper-quiet with anti-desync firmware — perfect for stealth and cinematography builds.',
    imageUrl: '/images/parts/ESC/6.jpg',
    specs: { current: '35A continuous', protocol: 'DSHOT600', firmware: 'BLHeli_32', housing: 'Sealed matte-black', weight: '12g' },
    stock: 35
  },

  // ── TRANSMITTERS ──
  {
    name: 'Aero-Spec Carbon TX',
    category: 'transmitter', price: 219.99, weight: 520,
    description: 'Premium carbon fiber bodied transmitter with copper-accented hall-effect gimbals and integrated color touchscreen. The flagship controller for serious pilots.',
    imageUrl: '/images/parts/transmitter/1.jpg',
    specs: { protocol: 'ELRS 2.4GHz', gimbals: 'Hall-effect copper', screen: 'Color touchscreen', battery: '18650 ×2', weight: '520g' },
    stock: 10
  },
  {
    name: 'Volt-Link 45A Silver TX',
    category: 'transmitter', price: 149.99, weight: 480,
    description: 'Brushed aluminum unibody transmitter with clean minimalist design. Crisp monochrome screen and tactile switches suit both simulators and real-world flying.',
    imageUrl: '/images/parts/transmitter/2.jpg',
    specs: { protocol: 'ELRS 2.4GHz', gimbals: 'Hall-effect', screen: 'Monochrome LCD', battery: '18650 ×2', finish: 'Brushed aluminum', weight: '480g' },
    stock: 18
  },
  {
    name: 'Volt-Power 45A Tactical TX',
    category: 'transmitter', price: 169.99, weight: 560,
    description: 'Rugged matte-black transmitter with copper accent lines and built-in OLED flight data screen. Ergonomic grip and programmable side switches.',
    imageUrl: '/images/parts/transmitter/3.jpg',
    specs: { protocol: 'ELRS 2.4GHz / Crossfire', gimbals: 'Hall-effect', screen: 'OLED color', battery: '18650 ×2', weight: '560g' },
    stock: 14
  },
  {
    name: 'H1-Tech Transparent TX',
    category: 'transmitter', price: 189.99, weight: 500,
    description: 'See-through skeleton transmitter exposing the illuminated circuit board and copper antenna traces. Full-spec ELRS radio wrapped in a LED-lit showcase shell.',
    imageUrl: '/images/parts/transmitter/4.jpg',
    specs: { protocol: 'ELRS 2.4GHz', gimbals: 'Hall-effect', housing: 'Clear PC with LED', screen: 'Color LCD', battery: '18650 ×2', weight: '500g' },
    stock: 8
  },
  {
    name: 'Pro-Stealth Compact TX',
    category: 'transmitter', price: 139.99, weight: 360,
    description: 'All-black low-profile transmitter with large central color screen and thumb-style gimbals. Compact enough for a backpack, capable enough for competition.',
    imageUrl: '/images/parts/transmitter/5.jpg',
    specs: { protocol: 'ELRS 2.4GHz', gimbals: 'Thumb hall-effect', screen: 'Large color LCD', battery: 'Built-in 3000mAh', weight: '360g' },
    stock: 22
  },
  {
    name: 'Terra-TX Field Controller',
    category: 'transmitter', price: 179.99, weight: 640,
    description: 'Bronze-finish weathered transmitter built for outdoor field use. Tactile rubber-coated body with GPS telemetry display and dual antenna for extended range.',
    imageUrl: '/images/parts/transmitter/6.jpg',
    specs: { protocol: 'ELRS 900MHz / 2.4GHz', gimbals: 'Hall-effect', screen: 'Monochrome data display', battery: '18650 ×2', finish: 'Weathered bronze', weight: '640g' },
    stock: 12
  }
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
    console.log('Done. Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
