#!/usr/bin/env node

/**
 * 🌷 LUMINIS ULTIMATE v7.0
 * AI Gaming Assistant with Voice Commands & Steam Integration
 * Architect: One2lv
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ============ CONFIGURATION ============
const CONFIG = {
  PORT: process.env.PORT || 8080,
  STEAM_API_KEY: process.env.STEAM_API_KEY || '',
  STEAM_ID: process.env.STEAM_ID || '',
  TWITCH_TOKEN: process.env.TWITCH_TOKEN || '',
  OBS_WS_URL: process.env.OBS_WS_URL || 'ws://localhost:4455',
  VOICE_ENABLED: process.env.VOICE_ENABLED === 'true',
  RESPONSE_TIME_TARGET: parseInt(process.env.RESPONSE_TARGET) || 50, // ms target
};

// ============ LOGGING ============
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// ============ EXPRESS SETUP ============
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// ============ DATABASE ============
const db = new Low(new JSONFile('./data/memory.json'), {
  councilVotes: {},
  combos: [],
  voiceCommands: [],
  playerStats: { responseTime: [], avgResponse: 0 },
  steamData: {},
  lastActive: null
});

async function initDB() {
  await db.read();
  db.data ||= {
    councilVotes: {},
    combos: [],
    voiceCommands: [],
    playerStats: { responseTime: [], avgResponse: 0 },
    steamData: {},
    lastActive: null
  };
  await db.write();
}

// ============ WEBSOCKET SERVER ============
const wss = new WebSocket.Server({ server });

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ============ CORE MODULES ============

// Combo Detector with response time tracking
const { detectCombo, recordResponseTime } = require('./modules/combo_detector');

// Voice Command Processor
const { VoiceCommandProcessor } = require('./modules/voice_commands');

// Steam Integration
const { SteamIntegration } = require('./integrations/steam_live');

// OBS Integration
const { OBSController } = require('./integrations/obs_controller');

// Council Voting System
const { CouncilVoting } = require('./modules/council_vote');

// Player Performance Tracker
const { PlayerTracker } = require('./modules/player_tracker');

// ============ API ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '7.0.0'
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  await db.read();
  res.json({
    system: 'Lumenis_v7',
    combo: db.data.playerStats,
    obs: OBSController.isConnected(),
    voice: CONFIG.VOICE_ENABLED,
    steam: SteamIntegration.isLinked(),
    targetResponseTime: CONFIG.RESPONSE_TIME_TARGET
  });
});

// Player action with response time tracking
app.post('/api/player/action', async (req, res) => {
  const startTime = Date.now();

  try {
    const { action, gameData } = req.body;

    // Detect combo
    const comboResult = detectCombo({ type: action, damage: gameData?.damage || 10 });

    // Record response time
    const responseTime = Date.now() - startTime;
    recordResponseTime(responseTime);

    await db.read();
    db.data.playerStats.responseTime.push({
      time: startTime,
      duration: responseTime,
      action,
      combo: comboResult
    });

    // Keep only last 1000 entries
    if (db.data.playerStats.responseTime.length > 1000) {
      db.data.playerStats.responseTime = db.data.playerStats.responseTime.slice(-1000);
    }

    // Calculate average
    const times = db.data.playerStats.responseTime.map(r => r.duration);
    db.data.playerStats.avgResponse = times.reduce((a, b) => a + b, 0) / times.length;

    await db.write();

    // Broadcast to WebSocket clients
    broadcast({
      type: 'player_action',
      data: { action, responseTime, combo: comboResult }
    });

    res.json({
      success: true,
      responseTime,
      targetMet: responseTime <= CONFIG.RESPONSE_TIME_TARGET,
      combo: comboResult
    });

  } catch (error) {
    logger.error('Player action error:', error);
    res.status(500).json({ error: 'Action processing failed' });
  }
});

// Voice command endpoint
app.post('/api/voice/command', async (req, res) => {
  try {
    const { command, confidence } = req.body;

    await db.read();
    db.data.voiceCommands.push({
      command,
      confidence,
      timestamp: Date.now()
    });
    await db.write();

    broadcast({
      type: 'voice_command',
      data: { command, confidence }
    });

    res.json({ success: true, acknowledged: true });
  } catch (error) {
    res.status(500).json({ error: 'Voice command failed' });
  }
});

// Council voting
app.post('/api/council/vote', async (req, res) => {
  try {
    const { agent, strategy } = req.body;
    const result = CouncilVoting.vote(agent, strategy);

    await db.read();
    db.data.councilVotes[strategy] = (db.data.councilVotes[strategy] || 0) + 1;
    await db.write();

    broadcast({
      type: 'council_vote',
      data: { agent, strategy, votes: db.data.councilVotes }
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Voting failed' });
  }
});

app.get('/api/council/result', async (req, res) => {
  const result = CouncilVoting.getResult();
  res.json({ strategy: result, votes: db.data.councilVotes });
});

// Steam endpoints
app.get('/api/steam/status', async (req, res) => {
  const status = SteamIntegration.getStatus();
  res.json(status);
});

app.get('/api/steam/players', async (req, res) => {
  try {
    const players = await SteamIntegration.getPlayerSummaries();
    res.json({ players });
  } catch (error) {
    res.json({ players: [], error: error.message });
  }
});

app.get('/api/steam/community/:steamid', async (req, res) => {
  try {
    const data = await SteamIntegration.getCommunityData(req.params.steamid);
    res.json(data);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Telemetry ingestion
app.post('/api/telemetry', async (req, res) => {
  try {
    const { type, data } = req.body;

    const comboResult = detectCombo({ type, ...data });

    await db.read();
    db.data.combos.push({
      type,
      data,
      combo: comboResult,
      timestamp: Date.now()
    });

    // Keep last 500 combos
    if (db.data.combos.length > 500) {
      db.data.combos = db.data.combos.slice(-500);
    }
    await db.write();

    // Trigger OBS highlight on combo
    if (comboResult?.highlight) {
      OBSController.triggerHighlight();
    }

    broadcast({
      type: 'telemetry',
      data: { type, combo: comboResult }
    });

    res.json({ success: true, combo: comboResult });
  } catch (error) {
    res.status(500).json({ error: 'Telemetry processing failed' });
  }
});

// Council logs
app.get('/api/council/logs', async (req, res) => {
  await db.read();
  res.json(db.data.councilVotes);
});

// Player stats
app.get('/api/player/stats', async (req, res) => {
  await db.read();
  res.json(db.data.playerStats);
});

// Voice command history
app.get('/api/voice/history', async (req, res) => {
  await db.read();
  res.json(db.data.voiceCommands.slice(-50));
});

// ============ WEBSOCKET HANDLING ============
wss.on('connection', (ws) => {
  logger.info('Client connected');

  ws.send(JSON.stringify({ type: 'connected', message: 'Lumenis v7 ready' }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'voice_command':
          await VoiceCommandProcessor.process(data.command, ws);
          break;
        case 'player_action':
          // Already handled by REST API, but WebSocket can also trigger
          break;
      }
    } catch (error) {
      logger.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    logger.info('Client disconnected');
  });
});

// ============ STARTUP ============
async function start() {
  try {
    await initDB();

    // Initialize integrations
    if (CONFIG.STEAM_API_KEY) {
      SteamIntegration.init(CONFIG.STEAM_API_KEY, CONFIG.STEAM_ID);
    }

    if (CONFIG.VOICE_ENABLED) {
      VoiceCommandProcessor.init();
    }

    // Ensure directories exist
    ['logs', 'data', 'public'].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    server.listen(CONFIG.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║     🌷 LUMINIS ULTIMATE v7.0 🌷                      ║
║     ═══════════════════════════════                  ║
║     Status: ONLINE                                    ║
║     Port: ${CONFIG.PORT}                                       ║
║     Voice: ${CONFIG.VOICE_ENABLED ? 'ENABLED' : 'DISABLED'}                                ║
║     Steam: ${CONFIG.STEAM_API_KEY ? 'LINKED' : 'NOT CONFIGURED'}                            ║
║     Target Response: ${CONFIG.RESPONSE_TIME_TARGET}ms                           ║
║     ═══════════════════════════════                  ║
║     Commands: "hey lumen", "combo check", "stats"   ║
╚═══════════════════════════════════════════════════════╝
      `);

      logger.info('Lumenis v7 started successfully');
    });

  } catch (error) {
    logger.error('Startup failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down Lumenis...');
  await db.write();
  process.exit(0);
});

start();

module.exports = { app, server, broadcast };
