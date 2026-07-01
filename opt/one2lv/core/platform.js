/**
 * One2lvOS Phase 9 - Cross-Platform Utility
 * Provides OS-agnostic path resolution and platform information.
 *
 * Behavior:
 *   - Linux/macOS: Use conventional Unix paths (e.g., ~/.config/one2lv or /opt/one2lv when writable).
 *   - Windows:     Use %APPDATA%/one2lv and %LOCALAPPDATA%/one2lv.
 *
 * Environment overrides (highest priority):
 *   ONE2LV_HOME      - root install dir (contains core/, modules/, ui/, ai/, memory/, vector/, logs/)
 *   ONE2LV_DATA_DIR  - user data dir (memory/, vector/, logs/)
 *   ONE2LV_MEMORY_FILE, ONE2LV_VECTOR_FILE, ONE2LV_TOKEN_FILE - explicit files
 */

import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Detect platform once at module load.
 */
export const PLATFORM = process.platform;            // 'linux' | 'darwin' | 'win32' | ...
export const IS_WINDOWS = PLATFORM === 'win32';
export const IS_MAC = PLATFORM === 'darwin';
export const IS_LINUX = PLATFORM === 'linux';
export const OS_TYPE = os.type();                    // 'Linux', 'Darwin', 'Windows_NT'
export const OS_RELEASE = os.release();
export const ARCH = process.arch;                    // 'x64', 'arm64', ...
export const NODE_VERSION = process.version;
export const HOME_DIR = os.homedir();
export const TMP_DIR = os.tmpdir();

/**
 * Determine the user data directory in a cross-platform way.
 * Honors ONE2LV_DATA_DIR override.
 */
export function getDataDir() {
  if (process.env.ONE2LV_DATA_DIR) {
    return process.env.ONE2LV_DATA_DIR;
  }
  if (IS_WINDOWS) {
    const base = process.env.APPDATA || path.join(HOME_DIR, 'AppData', 'Roaming');
    return path.join(base, 'one2lv');
  }
  // macOS & Linux
  const xdg = process.env.XDG_DATA_HOME || path.join(HOME_DIR, '.local', 'share');
  if (IS_MAC) {
    return path.join(HOME_DIR, 'Library', 'Application Support', 'one2lv');
  }
  return path.join(xdg, 'one2lv');
}

/**
 * Determine the install/root directory.
 *
 * Resolution order:
 *   1. ONE2LV_HOME env var (if set and exists)
 *   2. The directory of this module's parent's parent (the one2lv install dir)
 *   3. /opt/one2lv on Linux/macOS (if writable)
 *   4. ~/.local/share/one2lv (fallback)
 */
export function getRootDir() {
  if (process.env.ONE2LV_HOME && fs.existsSync(process.env.ONE2LV_HOME)) {
    return process.env.ONE2LV_HOME;
  }
  // core/platform.js -> opt/one2lv
  const inferred = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(inferred, 'core', 'token.js'))) {
    return inferred;
  }
  if (!IS_WINDOWS) {
    const candidate = '/opt/one2lv';
    try {
      fs.accessSync(candidate, fs.constants.R_OK | fs.constants.W_OK);
      return candidate;
    } catch {}
  }
  return getDataDir();
}

/**
 * Resolve important directories.
 */
export function getDirs() {
  const root = getRootDir();
  const data = getDataDir();
  return {
    root,
    data,
    core: path.join(root, 'core'),
    modules: path.join(root, 'modules'),
    ui: path.join(root, 'ui'),
    ai: path.join(root, 'ai'),
    memory: path.join(data, 'memory'),
    vector: path.join(data, 'vector'),
    logs: path.join(data, 'logs'),
    sandbox: path.join(root, 'sandbox'),
    mesh: path.join(root, 'mesh')
  };
}

/**
 * Resolve important files.
 */
export function getFiles() {
  const d = getDirs();
  return {
    memory: process.env.ONE2LV_MEMORY_FILE || path.join(d.memory, 'memory.json'),
    vector: process.env.ONE2LV_VECTOR_FILE || path.join(d.vector, 'vectors.json'),
    token: process.env.ONE2LV_TOKEN_FILE || path.join(d.core, 'token.key'),
    tokenModule: path.join(d.core, 'token.js'),
    launchScript: path.join(d.root, 'launch.js'),
    capabilities: path.join(d.core, 'capabilities.json')
  };
}

/**
 * Ensure all required directories exist (creates them if missing).
 */
export function ensureDirs() {
  const d = getDirs();
  for (const dir of [d.core, d.memory, d.vector, d.logs, d.sandbox, d.mesh]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Convert a path to its platform-native representation.
 * Mostly a no-op on POSIX systems; converts forward slashes to backslashes on Windows.
 */
export function native(p) {
  if (!p) return p;
  return IS_WINDOWS ? p.replace(/\//g, '\\') : p;
}

/**
 * Open the OS default file/URL handler in a cross-platform way.
 * Uses the `open` package if available, otherwise falls back to shell commands.
 */
export async function openExternal(target) {
  try {
    const mod = await import('open');
    const open = mod.default || mod;
    await open(target);
    return true;
  } catch {
    // Fallback: try the platform-native command
    try {
      const { spawn } = await import('child_process');
      let cmd, args;
      if (IS_WINDOWS) {
        cmd = 'cmd';
        args = ['/c', 'start', '""', target];
      } else if (IS_MAC) {
        cmd = 'open';
        args = [target];
      } else {
        cmd = 'xdg-open';
        args = [target];
      }
      const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
      child.unref();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Return a short human-readable platform string.
 */
export function describePlatform() {
  return `${OS_TYPE} ${OS_RELEASE} (${ARCH})`;
}

export default {
  PLATFORM,
  IS_WINDOWS,
  IS_MAC,
  IS_LINUX,
  OS_TYPE,
  OS_RELEASE,
  ARCH,
  NODE_VERSION,
  HOME_DIR,
  TMP_DIR,
  getDataDir,
  getRootDir,
  getDirs,
  getFiles,
  ensureDirs,
  native,
  openExternal,
  describePlatform
};