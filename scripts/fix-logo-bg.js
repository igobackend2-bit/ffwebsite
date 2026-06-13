const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '..', 'public', 'logo.png');
const temp = path.join(__dirname, '..', 'public', 'logo-fixed.png');

sharp(input)
  .flatten({ background: { r: 26, g: 77, b: 54 } }) // #1a4d36 — matches CSS container bg
  .png()
  .toFile(temp)
  .then((info) => {
    fs.copyFileSync(temp, input);
    fs.unlinkSync(temp);
    console.log('logo.png updated — transparency flattened with #1a4d36 background', info);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
