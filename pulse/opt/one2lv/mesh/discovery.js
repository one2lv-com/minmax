/**
 * One2lvOS Peer Discovery
 * Phase 4-8: UDP broadcast-based peer discovery
 */

import dgram from 'dgram';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const CONFIG = {
  DISCOVERY_PORT: 41234,
  DISCOVERY_GROUP: '255.255.255.255',
  ANNOUNCE_INTERVAL: 30000, // 30 seconds
  PEER_TIMEOUT: 120000, // 2 minutes
  DISCOVERY_MESSAGE: 'one2lv-node'
};

/**
 * Peer discovery manager
 */
class PeerDiscovery {
  constructor(options = {}) {
    this.port = options.port || CONFIG.DISCOVERY_PORT;
    this.socket = null;
    this.peers = new Map(); // peer address -> { lastSeen, info }
    this.announceInterval = null;
    this.cleanupInterval = null;
    this.onPeerFound = options.onPeerFound || (() => {});
    this.onPeerLost = options.onPeerLost || (() => {});
  }

  /**
   * Start discovery
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

        this.socket.on('error', (err) => {
          console.error('[Discovery] Socket error:', err.message);
          reject(err);
        });

        this.socket.on('message', (msg, rinfo) => {
          this.handleMessage(msg.toString(), rinfo);
        });

        this.socket.on('listening', () => {
          const address = this.socket.address();
          console.log(`[Discovery] Listening on ${address.address}:${address.port}`);

          // Enable broadcast
          this.socket.setBroadcast(true);

          // Start announcing
          this.startAnnouncing();
          this.startCleanup();

          resolve(this);
        });

        this.socket.bind(this.port);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop discovery
   */
  stop() {
    if (this.announceInterval) {
      clearInterval(this.announceInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.socket) {
      this.socket.close();
    }
  }

  /**
   * Broadcast presence
   */
  broadcast() {
    const message = Buffer.from(CONFIG.DISCOVERY_MESSAGE);
    this.socket.send(
      message,
      0,
      message.length,
      this.port,
      CONFIG.DISCOVERY_GROUP
    );
  }

  /**
   * Start periodic broadcasting
   */
  startAnnouncing() {
    // Initial broadcast
    this.broadcast();

    // Periodic broadcast
    this.announceInterval = setInterval(() => {
      this.broadcast();
    }, CONFIG.ANNOUNCE_INTERVAL);
  }

  /**
   * Start cleanup of stale peers
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const stale = [];

      for (const [address, peer] of this.peers) {
        if (now - peer.lastSeen > CONFIG.PEER_TIMEOUT) {
          stale.push(address);
        }
      }

      for (const address of stale) {
        this.peers.delete(address);
        this.onPeerLost(address);
        console.log(`[Discovery] Peer lost: ${address}`);
      }
    }, CONFIG.PEER_TIMEOUT / 2);
  }

  /**
   * Handle incoming message
   */
  handleMessage(message, rinfo) {
    // Ignore our own messages
    if (rinfo.address === '127.0.0.1') return;

    if (message.startsWith(CONFIG.DISCOVERY_MESSAGE)) {
      const isNew = !this.peers.has(rinfo.address);

      this.peers.set(rinfo.address, {
        lastSeen: Date.now(),
        port: rinfo.port
      });

      if (isNew) {
        console.log(`[Discovery] Peer found: ${rinfo.address}:${rinfo.port}`);
        this.onPeerFound(rinfo.address, rinfo.port);
      }
    }
  }

  /**
   * Get all known peers
   */
  getPeers() {
    return Array.from(this.peers.keys());
  }

  /**
   * Get peer count
   */
  getPeerCount() {
    return this.peers.size;
  }

  /**
   * Check if peer is known
   */
  hasPeer(address) {
    return this.peers.has(address);
  }

  /**
   * Refresh peer status
   */
  refreshPeer(address) {
    if (this.peers.has(address)) {
      this.peers.get(address).lastSeen = Date.now();
    }
  }
}

/**
 * Discover peers via HTTP (fallback)
 */
async function discoverViaHTTP(seedPeers) {
  const discovered = [];

  for (const peer of seedPeers) {
    try {
      const url = new URL(peer);
      const client = url.protocol === 'https:' ? https : http;

      const result = await new Promise((resolve) => {
        const req = client.get(`${peer}/api/peers`, { timeout: 3000 }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(null);
            }
          });
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
      });

      if (result && result.peers) {
        discovered.push(...result.peers);
      }
    } catch {
      // Ignore errors
    }
  }

  return discovered;
}

/**
 * Announce self via HTTP
 */
async function announceSelf(port = 9000) {
  const server = http.createServer((req, res) => {
    if (req.url === '/api/peers') {
      // Get peer info
      try {
        const token = fs.readFileSync('/opt/one2lv/core/token.key', 'utf8').trim();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          peers: [{
            id: token.substring(0, 16),
            address: 'localhost',
            port,
            version: '4.0.0'
          }]
        }));
      } catch {
        res.writeHead(500);
        res.end('{}');
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[Discovery] HTTP announce server on port ${port}`);
      resolve(server);
    });
  });
}

export {
  PeerDiscovery,
  discoverViaHTTP,
  announceSelf,
  CONFIG
};

export default PeerDiscovery;
