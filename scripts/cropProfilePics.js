const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function run() {
  const src = path.join(__dirname, '../assests/profilepics.jpg');
  const outDir = path.join(__dirname, '../public/images/avatars');
  fs.mkdirSync(outDir, { recursive: true });

  const img = await Jimp.read(src);
  const W = img.width;
  const H = img.height;
  const COLS = 5, ROWS = 4;
  const cellW = Math.floor(W / COLS);
  const cellH = Math.floor(H / ROWS);

  let n = 1;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const clone = img.clone();
      clone.crop({ x: col * cellW, y: row * cellH, w: cellW, h: cellH });
      clone.resize({ w: 200, h: 200 });
      await clone.write(path.join(outDir, `avatar-${n}.jpg`));
      console.log(`Saved avatar-${n}.jpg`);
      n++;
    }
  }
  console.log('Done — 20 avatars saved to public/images/avatars/');
}

run().catch(console.error);
