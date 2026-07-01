# 🌷 Lumenis Ultimate v7.0

AI Gaming Assistant with Voice Commands, Steam Integration, and Multi-Agent Council Voting

## Features

- 🎤 **Voice Commands** - "Hey Lumen" wake word with natural language processing
- ⚡ **Player Response Tracking** - Real-time response time monitoring (target: 50ms)
- 🎯 **Combo Detection** - Multi-hit combo detection with visual feedback
- 🗳️ **AI Council Voting** - Multi-agent strategy consensus system
- 🎮 **Steam Live** - Real-time Steam community integration
- 📺 **OBS Control** - Auto-highlight and scene switching
- 💻 **Terminal Interface** - Linux-style command execution
- 🔗 **WebSocket Support** - Real-time updates to dashboard

## Quick Start (Termux)

```bash
cd ~/lumenis-v7
bash setup.sh
nano .env  # Add your API keys
npm start
```

## API Keys Required

### Moltbook Agents
```env
MOLTBOOK_KEY_1=moltbook_sk_-INMPFZ19SBjEPWeRWgJws2ZnNdloLx9
MOLTBOOK_KEY_2=moltbook_sk_rta76b8MLXbb6NslcH_2m5uxGb9i1Lfe
MOLTBOOK_KEY_3=moltbook_sk_Rh0OrHhGasfbwVm-PHbbKwl5MSZlVV4D
```

### Steam (Optional)
Get your API key from: https://steamcommunity.com/dev/apikey
Get your SteamID from: https://steamid.io/

```env
STEAM_API_KEY=your_key_here
STEAM_ID=your_steamid_here
```

## Voice Commands

Say "Hey Lumen" followed by:
- "combo check" - Check combo system status
- "stats" - Get player performance stats
- "highlight" - Trigger OBS highlight scene
- "steam status" - Check Steam connection
- "system status" - Overall system health
- "help" - Show available commands

## API Endpoints

### Player Actions
```
POST /api/player/action
Body: { "action": "hit", "gameData": { "damage": 10 } }
```

### Telemetry
```
POST /api/telemetry
Body: { "type": "hit", "data": { "damage": 10 } }
```

### Voice Commands
```
POST /api/voice/command
Body: { "command": "hey lumen stats", "confidence": 0.95 }
```

### Council Voting
```
POST /api/council/vote
Body: { "agent": "Player", "strategy": "Aggressive" }

GET /api/council/result
```

### Steam
```
GET /api/steam/status
GET /api/steam/players
GET /api/steam/community/:steamid
```

## Architecture

```
lumenis-v7/
├── server.js           # Main server
├── modules/
│   ├── combo_detector.js    # Combo tracking
│   ├── voice_commands.js    # Voice processing
│   ├── council_vote.js      # AI voting
│   └── player_tracker.js   # Performance stats
├── integrations/
│   ├── steam_live.js       # Steam API
│   └── obs_controller.js   # OBS WebSocket
├── public/
│   └── index.html          # Dashboard
└── .env               # Configuration
```

## Performance Metrics

- Target Response Time: 50ms
- Consistency Tracking: Real-time
- Combo Detection: 3+ hits in 2 seconds
- Voice Recognition: Browser Web Speech API

## License

MIT - One2lv
