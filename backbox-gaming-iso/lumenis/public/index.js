// BackBox Gaming OS - Lumenis v7.0
// Public Dashboard UI

const express = require('express');
const router = express.Router();

// Serve static dashboard
router.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumenis v7.0 - BackBox Gaming OS</title>
    <style>
        :root {
            --bg: #0a0a0f;
            --cyan: #00f5ff;
            --purple: #a855f7;
            --pink: #ec4899;
            --amber: #f59e0b;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: var(--bg);
            color: #fff;
            font-family: 'JetBrains Mono', monospace;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header {
            text-align: center;
            padding: 3rem 0;
            background: linear-gradient(135deg, var(--cyan), var(--purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .h1 { font-size: 3rem; font-weight: 700; }
        .subtitle { font-size: 1.2rem; opacity: 0.8; margin-top: 0.5rem; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 1.5rem;
        }
        .card-title { font-size: 1.1rem; color: var(--cyan); margin-bottom: 1rem; }
        .stat { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .stat-label { opacity: 0.7; }
        .stat-value { color: var(--cyan); }
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: var(--cyan);
            color: #000;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
        }
        .btn:hover { opacity: 0.9; }
        .status { display: flex; align-items: center; gap: 0.5rem; }
        .dot { width: 8px; height: 8px; background: #00ff88; border-radius: 50%; }
        .terminal {
            background: #000;
            padding: 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            max-height: 200px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="h1">LUMENIS v7.0</h1>
            <p class="subtitle">BackBox Gaming OS - Gaming Assistant</p>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-title">System Status</div>
                <div class="status">
                    <div class="dot"></div>
                    <span>Online</span>
                </div>
                <div class="stat"><span class="stat-label">Version</span><span class="stat-value">7.0.0</span></div>
                <div class="stat"><span class="stat-label">Platform</span><span class="stat-value">BackBox Gaming</span></div>
                <div class="stat"><span class="stat-label">Uptime</span><span class="stat-value" id="uptime">0:00:00</span></div>
            </div>

            <div class="card">
                <div class="card-title">Performance</div>
                <div class="stat"><span class="stat-label">Avg Response</span><span class="stat-value" id="response">--ms</span></div>
                <div class="stat"><span class="stat-label">Combo Hits</span><span class="stat-value" id="hits">0</span></div>
                <div class="stat"><span class="stat-label">Status</span><span class="stat-value" id="perf-status">Optimal</span></div>
            </div>

            <div class="card">
                <div class="card-title">Actions</div>
                <button class="btn" onclick="launchGame('brawlhalla')">Launch Brawlhalla</button>
                <button class="btn" onclick="startRecording()">Start Recording</button>
            </div>

            <div class="card">
                <div class="card-title">Terminal</div>
                <div class="terminal" id="terminal">
                    > Lumenis v7.0 initialized
                    > BackBox Gaming OS ready
                    > Awaiting commands...
                </div>
            </div>
        </div>
    </div>

    <script>
        let startTime = Date.now();
        setInterval(() => {
            const elapsed = Date.now() - startTime;
            const hours = Math.floor(elapsed / 3600000);
            const mins = Math.floor((elapsed % 3600000) / 60000);
            const secs = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('uptime').textContent =
                String(hours).padStart(2,'0') + ':' +
                String(mins).padStart(2,'0') + ':' +
                String(secs).padStart(2,'0');
        }, 1000);

        async function launchGame(game) {
            const term = document.getElementById('terminal');
            term.innerHTML += '<br>> Launching ' + game + '...';
            await fetch('/api/android/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: game })
            });
        }

        function startRecording() {
            const term = document.getElementById('terminal');
            term.innerHTML += '<br>> OBS Recording started';
        }
    </script>
</body>
</html>
    `);
});

module.exports = router;