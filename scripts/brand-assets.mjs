import sharp from 'sharp';
await sharp('public/social.svg').png().toFile('public/social.png');
await sharp('public/icon.svg').resize(180, 180).png().toFile('public/apple-icon.png');
console.log('Generated original social PNG and Apple icon.');
