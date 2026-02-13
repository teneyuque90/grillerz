import fs from 'node:fs';
import path from 'node:path';

const chefIds = ['erick-martinez', 'carlos-bbq', 'martin-asador', 'luis-bbq', 'cories-bbq'];
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const mediaRoot = path.resolve(process.cwd(), 'public/media/chefs');

function findAsset(chefId, baseName) {
  for (const extension of imageExtensions) {
    const filePath = path.join(mediaRoot, chefId, `${baseName}.${extension}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

let missingCount = 0;

console.log(`Media root: ${mediaRoot}`);

for (const chefId of chefIds) {
  const avatar = findAsset(chefId, 'avatar');
  const cover = findAsset(chefId, 'cover');
  const gallery = [findAsset(chefId, 'gallery-1'), findAsset(chefId, 'gallery-2'), findAsset(chefId, 'gallery-3')].filter(Boolean);

  const status = avatar && cover ? 'OK' : 'INCOMPLETO';
  if (!avatar) {
    missingCount += 1;
  }
  if (!cover) {
    missingCount += 1;
  }

  console.log(`\n[${status}] ${chefId}`);
  console.log(`  avatar: ${avatar ? 'si' : 'no'}`);
  console.log(`  cover: ${cover ? 'si' : 'no'}`);
  console.log(`  gallery: ${gallery.length}/3`);
}

if (missingCount > 0) {
  console.log(`\nResultado: faltan ${missingCount} archivos base (avatar/cover).`);
  process.exitCode = 1;
} else {
  console.log('\nResultado: media base completa.');
}
