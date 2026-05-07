const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const catalogueDir = path.join(__dirname, '../assests/catalogue');
const outputBase = path.join(__dirname, '../public/images/parts');

const catalogueMap = [
  { file: 'cameras.png',          category: 'camera' },
  { file: 'motors.png',           category: 'motors' },
  { file: 'batteries.png',        category: 'battery' },
  { file: 'Franes.png',           category: 'frame' },
  { file: 'FlightControllers.png',category: 'flightController' },
  { file: 'ESCs.png',             category: 'ESC' },
  { file: 'propellors.png',       category: 'propellers' },
  { file: 'transmitter.png',      category: 'transmitter' },
];

async function cropAll() {
  for (const { file, category } of catalogueMap) {
    const inputPath = path.join(catalogueDir, file);
    const outDir = path.join(outputBase, category);
    fs.mkdirSync(outDir, { recursive: true });

    const img = await Jimp.read(inputPath);
    const W = img.bitmap.width;
    const H = img.bitmap.height;
    const cellW = Math.floor(W / 3);
    const cellH = Math.floor(H / 2);

    let n = 1;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const cropped = img.clone().crop({ x: col * cellW, y: row * cellH, w: cellW, h: cellH });
        const outPath = path.join(outDir, `${n}.jpg`);
        await cropped.write(outPath);
        console.log(`Saved ${category}/${n}.jpg`);
        n++;
      }
    }
  }
  console.log('Done!');
}

cropAll().catch(console.error);
