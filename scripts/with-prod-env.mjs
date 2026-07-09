#!/usr/bin/env node
/**
 * Kør en kommando med produktions-miljøvariabler i .env — UDEN at miste din
 * lokale dev-.env.
 *
 * `vercel env pull .env --environment=production` OVERSKRIVER .env. Dette script
 * pakker operationen ind, så din nuværende .env altid lægges tilbage bagefter —
 * også hvis den indre kommando fejler eller du afbryder med Ctrl+C.
 *
 * Flow:
 *   1. Tag en backup af den nuværende .env (til en midlertidig .env.<ts>.bak).
 *   2. `vercel env pull .env --environment=production --yes`.
 *   3. Kør kommandoen du gav med (prod-værdier er nu i .env).
 *   4. Læg din oprindelige .env tilbage og slet backuppen.
 *
 * Brug:
 *   node scripts/with-prod-env.mjs "npm run blob:compress"
 *   node scripts/with-prod-env.mjs "npm run blob:compress -- --apply"
 *   npm run prod-env -- "npm run blob:compress -- --apply"
 *
 * Uden argument åbnes ingen kommando — så pulls du bare prod-env sikkert ind,
 * kører selv dine kommandoer, og scriptet restorer når du trykker Enter.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync, unlinkSync, rmSync } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const backupPath = path.join(root, `.env.${Date.now()}.bak`);

const command = process.argv.slice(2).join(' ').trim();
const hadOriginalEnv = existsSync(envPath);

function log(msg) {
  console.log(`\x1b[36m[prod-env]\x1b[0m ${msg}`);
}

function restore() {
  if (hadOriginalEnv) {
    if (existsSync(backupPath)) {
      copyFileSync(backupPath, envPath);
      rmSync(backupPath, { force: true });
      log('♻️  Lokal dev-.env lagt tilbage.');
    }
  } else if (existsSync(envPath)) {
    // Der var ingen .env før — fjern den prod-fil vi hentede.
    unlinkSync(envPath);
    log('♻️  Fjernede den hentede prod-.env (der var ingen .env før).');
  }
}

// Sørg for at vi altid restorer — også ved Ctrl+C.
let restored = false;
function safeRestore() {
  if (restored) return;
  restored = true;
  try {
    restore();
  } catch (err) {
    console.error(`\x1b[31m[prod-env] Kunne IKKE restore .env automatisk!\x1b[0m`);
    console.error(`   Din backup ligger i: ${backupPath}`);
    console.error(`   Læg den manuelt tilbage som .env.`);
    console.error(err);
  }
}
process.on('SIGINT', () => {
  console.log('');
  safeRestore();
  process.exit(130);
});

function main() {
  // 1. Backup
  if (hadOriginalEnv) {
    copyFileSync(envPath, backupPath);
    log(`📦 Backup af nuværende .env → ${path.basename(backupPath)}`);
  } else {
    log('ℹ️  Ingen eksisterende .env at tage backup af.');
  }

  // 2. Pull prod-env
  log('⬇️  Henter produktions-miljøvariabler…');
  const pull = spawnSync(
    'vercel',
    ['env', 'pull', '.env', '--environment=production', '--yes'],
    { cwd: root, stdio: 'inherit', shell: true }
  );
  if (pull.status !== 0) {
    log('❌ `vercel env pull` fejlede — restorer og afbryder.');
    safeRestore();
    process.exit(pull.status ?? 1);
  }

  // 3. Kør kommandoen (eller vent på Enter hvis ingen kommando er givet)
  let commandStatus = 0;
  if (command) {
    log(`▶️  Kører: ${command}`);
    const run = spawnSync(command, { cwd: root, stdio: 'inherit', shell: true });
    commandStatus = run.status ?? 1;
    log(commandStatus === 0 ? '✅ Kommando færdig.' : `⚠️  Kommando afsluttede med kode ${commandStatus}.`);
  } else {
    log('Prod-env er nu i .env. Kør dine kommandoer i en ANDEN terminal.');
    log('Tryk Enter her når du er færdig for at lægge din dev-.env tilbage…');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    // Bloker synkront-agtigt: vent på Enter før vi går videre til restore.
    const wait = () => new Promise((resolve) => rl.question('', () => { rl.close(); resolve(); }));
    return wait().then(() => {
      safeRestore();
      process.exit(0);
    });
  }

  // 4. Restore
  safeRestore();
  process.exit(commandStatus);
}

main();
