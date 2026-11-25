// Entry point for the make.fun "best cooking game" bounty.
//
// Dapur Kilat is handed in as plain static files: the browser loads game/index.html
// and its ES modules with no build step, no bundler and no network requests. This
// script assembles the submission directory:
//
//   <out>/game/          the playable game (copied from ./game beside this file)
//   <out>/screenshots/   four staged renders (copied from ./screenshots)
//   <out>/dossier.json   the judge's summary, built by the vendored library
//
// Node 22 + the standard library only. Outside the grader container the output
// directory is overridable so the same command works locally:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

/** The repository root: this file's directory. */
const root = fileURLToPath(new URL('.', import.meta.url));

/** Where the evaluator reads the entry; overridable while developing. */
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** The scorer's limits, mirroring reference/gate.json. */
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
} as const;

mkdirSync(outputDir, { recursive: true });

// The game is the product; copy its whole tree, including src/ modules.
const gameSource = join(root, 'game');
if (!existsSync(join(gameSource, 'index.html'))) {
  throw new Error(`missing game/index.html under ${gameSource}`);
}
cpSync(gameSource, join(outputDir, 'game'), { recursive: true });

// Screenshots are optional for local runs but shipped in the real entry.
const shotsSource = join(root, 'screenshots');
if (existsSync(shotsSource)) {
  cpSync(shotsSource, join(outputDir, 'screenshots'), { recursive: true });
}

// buildDossier reads what actually landed in the output directory, so its
// counts can never drift from the files the judge will see.
const dossier = buildDossier(outputDir, CAPS);
writeFileSync(join(outputDir, 'dossier.json'), dossier);

const gameFiles = existsSync(join(outputDir, 'game'))
  ? `${CAPS.game_max_files} file cap`
  : '';
console.log(`Dapur Kilat packaged into ${outputDir} (${gameFiles})`);
