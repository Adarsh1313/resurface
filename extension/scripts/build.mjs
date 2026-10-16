// Builds the extension into dist/.
//
//   npm run build        → production URLs (as written in src/)
//   npm run build:local  → rewrites them to the local dev servers
//
// The source keeps the production URLs so a plain `tsc` / `npm run watch`
// still produces a working production build.
import { execSync } from 'node:child_process';
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const isLocal = process.argv.includes('--local');

const LOCAL_URLS = {
  'https://resurface-nclr.onrender.com': 'http://localhost:4000',
  'https://resurface-web-eight.vercel.app': 'http://localhost:3000',
};

execSync('npx tsc', { cwd: root, stdio: 'inherit' });
copyFileSync(join(root, 'src', 'prompt.css'), join(dist, 'prompt.css'));

if (isLocal) {
  for (const file of readdirSync(dist).filter((f) => f.endsWith('.js'))) {
    const path = join(dist, file);
    let code = readFileSync(path, 'utf8');
    for (const [prod, local] of Object.entries(LOCAL_URLS)) code = code.replaceAll(prod, local);
    writeFileSync(path, code);
  }
}

console.log(`Built extension (${isLocal ? 'local: localhost:4000 / localhost:3000' : 'production'}) → dist/`);
