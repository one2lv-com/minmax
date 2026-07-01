/**
 * One2lvOS Security Token Manager
 * Phase 4-8: Generates and validates secure tokens for RPC mesh
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  TOKEN_FILE: process.env.TOKEN_FILE || '/opt/one2lv/core/token.key',
  TOKEN_LENGTH: 32, // 32 bytes = 64 hex chars
  TOKEN_DIR: path.dirname(process.env.TOKEN_FILE || '/opt/one2lv/core/token.key')
};

/**
 * Generate a secure random token
 */
export function generateToken() {
  return crypto.randomBytes(CONFIG.TOKEN_LENGTH).toString('hex');
}

/**
 * Save token to file
 */
export function saveToken(token) {
  // Ensure directory exists
  if (!fs.existsSync(CONFIG.TOKEN_DIR)) {
    fs.mkdirSync(CONFIG.TOKEN_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG.TOKEN_FILE, token);
  fs.chmodSync(CONFIG.TOKEN_FILE, 0o600); // Owner read/write only
  return token;
}

/**
 * Load token from file
 */
export function loadToken() {
  try {
    return fs.readFileSync(CONFIG.TOKEN_FILE, 'utf8').trim();
  } catch {
    return null;
  }
}

/**
 * Get or create token
 */
export function getOrCreateToken() {
  let token = loadToken();
  if (!token) {
    token = generateToken();
    saveToken(token);
    console.log('🔐 Generated new security token');
  }
  return token;
}

/**
 * Validate token
 */
export function validateToken(token) {
  const stored = loadToken();
  if (!stored) return false;

  // Constant-time comparison to prevent timing attacks
  if (token.length !== stored.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(stored)
  );
}

/**
 * Sign data with token
 */
export function sign(data) {
  const token = getOrCreateToken();
  const hmac = crypto.createHmac('sha256', token);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

/**
 * Verify signed data
 */
export function verify(data, signature) {
  const expected = sign(data);
  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Auto-initialize
if (import.meta.url === `file://${process.argv[1]}`) {
  const token = getOrCreateToken();
  console.log('🔐 Token initialized:', token.substring(0, 8) + '...' + token.substring(56));
}

export default {
  generateToken,
  saveToken,
  loadToken,
  getOrCreateToken,
  validateToken,
  sign,
  verify
};
