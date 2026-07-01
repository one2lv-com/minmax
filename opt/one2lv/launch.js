#!/usr/bin/env node
/**
 * One2lvOS Phase 9 - Cross-Platform Launcher
 * Works on Linux, macOS, and Windows 11
 */
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  getDirs,
  getFiles,
  ensureDirs,
  describePlatform,
  IS_WINDOWS,
  openExternal
} from './core/platform.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRS = getDirs();
const FILES = getFiles();

const CONFIG = {
  UI_PORT: process.env.UI_PORT || 8080,
  WS_PORT: process.env.WS_PORT || 8081,
  ROOT_DIR: DIRS.root,
  MEMORY_DIR: DIRS.memory,
  VECTOR_DIR: DIRS.vector,
  LOGS_DIR: DIRS.logs,
  MODULES_DIR: DIRS.modules
};

function printBanner() {
  console.log('');
  console.log('================================================================');
  console.log('   One2lvOS Phase 9 - Full Autonomous Delta Engine');
  console.log('   Cross-Platform Edition');
  console.log('   (Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors');
  console.log('================================================================');
  console.log('');
  console.log(`   Platform: ${describePlatform()}`);
  console.log(`   Node:     ${process.version}`);
  console.log(`   Root:     ${CONFIG.ROOT_DIR}`);
  console.log('');
}

function initialize() {
  console.log('[*] Initializing directories...');
  ensureDirs();

  const memFile = FILES.memory;
  if (!fs.existsSync(memFile)) {
    const initial = { nodes: [], beliefs: [], goals: [], patterns: [], links: [] };
    fs.writeFileSync(memFile, JSON.stringify(initial, null, 2));
    console.log('[OK] Created memory file');
  }

  const vecFile = FILES.vector;
  if (!fs.existsSync(vecFile)) {
    fs.writeFileSync(vecFile, '[]');
  }

  const tokenFile = FILES.token;
  if (!fs.existsSync(tokenFile)) {
    const token = crypto.randomBytes(32).toString('base64');
    fs.writeFileSync(tokenFile, token);
    console.log('[OK] Generated security token');
  }
}

function spawnService(name, script, logFile) {
  console.log(`    [${name}] Starting...`);

  const out = fs.openSync(logFile, 'a');
  const err = fs.openSync(logFile + '.err', 'a');

  const child = spawn(process.execPath, [script], {
    cwd: __dirname,
    detached: !IS_WINDOWS,
    stdio: ['ignore', out, err],
    windowsHide: true
  });

  child.unref();
  return child;
}

async function main() {
  printBanner();
  initialize();

  console.log('');
  console.log('[*] Starting Phase 9 services...');
  console.log('    (Cubed) 3D Vector Engine');
  console.log('    (Delta) 9-Layer Delta Stack');
  console.log('');

  const uiLog = path.join(CONFIG.LOGS_DIR, 'ui.log');
  const uiProcess = spawnService('UI', path.join(__dirname, 'ui', 'server.js'), uiLog);

  const councilLog = path.join(CONFIG.LOGS_DIR, 'council.log');
  const councilProcess = spawnService('Council', path.join(__dirname, 'ai', 'council', 'council.js'), councilLog);

  setTimeout(async () => {
    console.log('');
    console.log('================================================================');
    console.log('   One2lvOS Phase 9 Running!');
    console.log('================================================================');
    console.log('');
    console.log(`   Dashboard:  http://localhost:${CONFIG.UI_PORT}`);
    console.log(`   WebSocket:  ws://localhost:${CONFIG.WS_PORT}`);
    console.log('');
    console.log('   Phase 9 Symbols:');
    console.log('   - (Cubed)  3D Vectors (x, y, z)');
    console.log('   - (++)     Amplify (x1.2)');
    console.log('   - (--)     Attenuate (x0.8)');
    console.log('   - (Delta)  Delta Gradient');
    console.log('   - (Delta9) 9-Layer Cap');
    console.log('');
    console.log(`   Logs:    ${CONFIG.LOGS_DIR}`);
    console.log(`   UI PID:  ${uiProcess.pid}`);
    console.log(`   Council: ${councilProcess.pid}`);
    console.log('');
    console.log('   Press Ctrl+C to stop');
    console.log('================================================================');
    console.log('');

    if (process.env.ONE2LV_NO_BROWSER !== '1') {
      openExternal(`http://localhost:${CONFIG.UI_PORT}`).catch(() => {});
    }
  }, 2000);

  const shutdown = () => {
    console.log('');
    console.log('[*] Stopping One2lvOS Phase 9...');
    try {
      process.kill(uiProcess.pid, 'SIGTERM');
      process.kill(councilProcess.pid, 'SIGTERM');
    } catch {}
    setTimeout(() => process.exit(0), 1000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  if (IS_WINDOWS) {
    process.on('SIGBREAK', shutdown);
  }
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});