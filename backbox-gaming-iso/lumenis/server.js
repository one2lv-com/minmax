// BackBox Gaming OS - Lumenis Ultimate v7.0
// Main Server

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { Telemetry } = require('./modules/telemetry_combo_detector');
const { Council } = require('./modules/council');
const { Trainer } = require('./modules/trainer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize modules
const telemetry = new Telemetry();
const council = new Council();
const trainer = new Trainer();

// WebSocket handling
wss.on('connection', (ws) => {
    console.log('[Lumenis] Client connected');
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            handleWSMessage(ws, data);
        } catch (e) {
            console.error('[Lumenis] Parse error:', e);
        }
    });
    ws.on('close', () => console.log('[Lumenis] Client disconnected'));
});

function handleWSMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
        case 'telemetry':
            const result = telemetry.process(payload);
            ws.send(JSON.stringify({ type: 'telemetry_result', payload: result }));
            break;

        case 'council_vote':
            const decision = council.vote(payload);
            ws.send(JSON.stringify({ type: 'council_decision', payload: decision }));
            break;

        case 'train_event':
            trainer.record(payload);
            ws.send(JSON.stringify({ type: 'event_recorded', payload }));
            break;
    }
}

// REST API Routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        version: '7.0',
        modules: {
            telemetry: telemetry.status(),
            council: council.status(),
            trainer: trainer.status()
        }
    });
});

app.post('/api/android/launch', (req, res) => {
    const { target } = req.body;
    console.log(`[Lumenis] Launching: ${target}`);
    res.json({ success: true, target, timestamp: Date.now() });
});

app.post('/api/trainer/event', (req, res) => {
    const { event } = req.body;
    trainer.record({ type: event, timestamp: Date.now() });
    res.json({ success: true, event });
});

// Port configuration
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`[Lumenis] Server running on port ${PORT}`);
    console.log('[Lumenis] BackBox Gaming OS v7.0 initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Lumenis] Shutting down...');
    server.close(() => process.exit(0));
});

module.exports = { app, server };