import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lightSvg } from './light-theme.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raster = async file => `data:image/jpeg;base64,${(await readFile(resolve(root, file))).toString('base64')}`;
const images = await Promise.all([
  'assets/moonlit-coast',
  ...['e-esj', 'nticemploi', 'tracksnap', 'pictracker'].map(slug => `assets/project-art/${slug}`),
].map(async stem => [await raster(`${stem}.jpg`), await raster(`${stem}-light.jpg`)]));

const files = [
  'alx', 'alx-mobile', 'alx-capstone', 'alx-capstone-mobile',
  'stack', 'stack-mobile', 'music', 'music-mobile',
  'stats', 'stats-mobile', 'contributions', 'contributions-mobile', 'activity', 'activity-mobile',
].map(stem => `assets/${stem}.svg`);
for (const directory of ['projects', 'learning', 'tech']) {
  for (const name of await readdir(resolve(root, 'assets', directory))) {
    if (name.endsWith('.svg') && !name.endsWith('-light.svg')) files.push(`assets/${directory}/${name}`);
  }
}
for (const file of files) {
  const dark = await readFile(resolve(root, file), 'utf8');
  await writeFile(resolve(root, file.replace(/\.svg$/, '-light.svg')), lightSvg(dark, { images }));
}
console.log(`Built ${files.length} light SVG companions with unchanged dimensions and outlined Poppins text.`);
