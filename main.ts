// PERIHELION — entry program for make.fun's best-game-01 bounty.
// Runs on Node 22+ with the standard library only. It hands the game in by
// copying game/ and screenshots/ next to this file into the output directory
// (/output in the grader's container, MAKEFUN_OUTPUT_DIR locally) and writing
// dossier.json there with the kit's vendored library.
//
// Try it locally:
//   node serve.ts                      # play at http://localhost:8080
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The dossier is rebuilt from the copied files with the same caps the scorer
// enforces, so a folder that passes here passes the gate there.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`PERIHELION handed in: game/ and screenshots/ copied, dossier.json is ${dossier.length} bytes.`);
