const fs = require('fs');
const path = require('path');
const GifReader = require('omggif').GifReader;
const GifEncoder = require('gif-encoder-2');

function dist(r1,g1,b1,r2,g2,b2) {
  return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
}

// Magenta is our transparency key color — must not appear naturally in the drone
const TRANS_R = 255, TRANS_G = 0, TRANS_B = 254;
const TRANSPARENT_COLOR = (TRANS_R << 16) | (TRANS_G << 8) | TRANS_B; // 0xFF00FE

function recolorPixel(r, g, b, a) {
  if (a === 0) return [TRANS_R, TRANS_G, TRANS_B]; // key color → transparent
  if (r > 220 && g > 220 && b > 220) return [TRANS_R, TRANS_G, TRANS_B]; // white bg → transparent
  if (r > 170 && g > 165 && b > 175 && dist(r,g,b,215,210,225) < 80)
    return [255, 255, 255];
  if (r < 90 && g < 90 && b < 110)
    return [255, 255, 255];
  if (b > 140 && dist(r,g,b,71,180,251) < 120)
    return [180, 79, 255];
  return [r, g, b];
}

async function run() {
  const srcPath = path.join(__dirname, '../public/images/drone-lineal.gif');
  const outPath = path.join(__dirname, '../public/images/drone-lineal-purple.gif');

  const buf = fs.readFileSync(srcPath);
  const reader = new GifReader(new Uint8Array(buf));
  const { width, height } = reader;
  const numFrames = reader.numFrames();
  console.log(`GIF: ${width}x${height}, ${numFrames} frames`);

  const encoder = new GifEncoder(width, height, 'neuquant', true);
  const info0 = reader.frameInfo(0);
  encoder.setDelay(info0.delay ? info0.delay * 10 : 80);
  encoder.setRepeat(0);
  encoder.setTransparent(TRANSPARENT_COLOR);

  // collect via createReadStream
  const stream = encoder.createReadStream();
  const chunks = [];
  stream.on('data', c => chunks.push(c));
  const done = new Promise((res, rej) => {
    stream.on('end', res);
    stream.on('error', rej);
  });

  encoder.start();

  for (let f = 0; f < numFrames; f++) {
    const info = reader.frameInfo(f);
    if (info.delay) encoder.setDelay(info.delay * 10);

    const framePixels = new Uint8ClampedArray(width * height * 4);
    reader.decodeAndBlitFrameRGBA(f, framePixels);

    const outPixels = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const [nr, ng, nb] = recolorPixel(
        framePixels[idx], framePixels[idx+1], framePixels[idx+2], framePixels[idx+3]
      );
      outPixels[idx]=nr; outPixels[idx+1]=ng; outPixels[idx+2]=nb; outPixels[idx+3]=255;
    }

    encoder.addFrame(outPixels);
    process.stdout.write(`  frame ${f+1}/${numFrames}\r`);
  }

  encoder.finish();
  await done;

  fs.writeFileSync(outPath, Buffer.concat(chunks));
  const size = fs.statSync(outPath).size;
  console.log(`\nSaved: ${outPath} (${(size/1024).toFixed(0)} KB)`);
}

run().catch(console.error);
