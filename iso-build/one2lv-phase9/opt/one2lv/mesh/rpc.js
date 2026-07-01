/**
 * One2lvOS Secure RPC Mesh
 * Phase 4-8: Inter-node secure communication
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import { validateToken, sign } from '../core/token.js';

/**
 * Send RPC request to peer
 */
export function send(peer, data, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(peer);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      // Load token
      let token = '';
      try {
        token = fs.readFileSync('/opt/one2lv/core/token.key', 'utf8').trim();
      } catch {
        reject(new Error('Token not available'));
        return;
      }

      // Sign payload
      const payload = JSON.stringify({
        token,
        data,
        timestamp: Date.now(),
        signature: sign(data)
      });

      const reqOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-One2lv-Token': token
        },
        timeout: options.timeout || 5000
      };

      const req = client.request(reqOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(payload);
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Validate incoming RPC request
 */
export function validateRequest(req) {
  const token = req.headers['x-one2lv-token'];

  if (!token) {
    return { valid: false, error: 'Missing token' };
  }

  const isValid = validateToken(token);

  if (!isValid) {
    return { valid: false, error: 'Invalid token' };
  }

  // Check timestamp (prevent replay attacks)
  const body = req.body || {};
  if (body.timestamp) {
    const age = Date.now() - body.timestamp;
    if (age > 60000) { // 1 minute max age
      return { valid: false, error: 'Request too old' };
    }
  }

  return { valid: true };
}

/**
 * Create RPC server
 */
export function createRPCServer(handler) {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-One2lv-Token');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Validate request
    const validation = validateRequest(req);

    if (!validation.valid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: validation.error }));
      return;
    }

    // Parse body
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const result = handler(data, req);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  });

  return server;
}

/**
 * Broadcast to all known peers
 */
export async function broadcast(peers, data) {
  const results = await Promise.allSettled(
    peers.map(peer => send(peer, data))
  );

  return results.map((result, i) => ({
    peer: peers[i],
    success: result.status === 'fulfilled',
    result: result.value || result.reason
  }));
}

/**
 * Get peer info
 */
export function getPeerInfo() {
  try {
    const token = fs.readFileSync('/opt/one2lv/core/token.key', 'utf8').trim();
    return {
      id: token.substring(0, 16),
      token: token.substring(0, 8) + '...',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '4.0.0',
      phase: '4-8'
    };
  } catch {
    return null;
  }
}

/**
 * Create mesh network client
 */
export class MeshClient {
  constructor(peers = []) {
    this.peers = new Set(peers);
    this.handlers = new Map();
  }

  addPeer(peer) {
    this.peers.add(peer);
  }

  removePeer(peer) {
    this.peers.delete(peer);
  }

  on(action, handler) {
    this.handlers.set(action, handler);
  }

  async send(action, data) {
    const peers = Array.from(this.peers);
    return broadcast(peers, { action, data });
  }

  async request(peer, action, data, timeout = 5000) {
    return send(peer, { action, data }, { timeout });
  }
}

export default {
  send,
  validateRequest,
  createRPCServer,
  broadcast,
  getPeerInfo,
  MeshClient
};
