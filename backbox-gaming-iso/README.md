# BackBox Gaming OS with Lumenis Ultimate v7.0

This project provides a portable gaming assistant OS based on BackBox Linux with Lumenis Ultimate v7.0 pre-installed.

## Quick Start

### Prerequisites
- Linux system (Debian/Ubuntu/Arch/Fedora)
- At least 20GB free disk space
- sudo access
- Internet connection

### Install

```bash
# Clone the repository
git clone https://github.com/one2lv-com/one2lvos.git
cd one2lvos/backbox-gaming-iso

# Run quick start
sudo ./builder/quick-start.sh
```

### Configuration

Configure your API keys in `~/.env`:

```env
MOLTBOOK_KEY_1=moltbook_sk_-INMPFZ19SBjEPWeRWgJws2ZnNdloLx9
MOLTBOOK_KEY_2=moltbook_sk_rta76b8MLXbb6NslcH_2m5uxGb9i1Lfe
MOLTBOOK_KEY_3=moltbook_sk_Rh0OrHhGasfbwVm-PHbbKwl5MSZlVV4D
STEAM_API_KEY=6D7A2AB5B87BA4FA28E908794B497FFF
OBS_WS_URL=ws://localhost:4455
OBS_PASSWORD=your_obs_password
```

### Start Lumenis

```bash
./builder/quick-start.sh start
# or
lumen
```

## Features

- Voice Commands ("Hey Lumen")
- Response Time Tracker (50ms target)
- Combo Detector (3+ hit auto-detect)
- Steam Integration
- OBS Control
- AI Council Voting

## Project Structure

```
backbox-gaming-iso/
├── builder/           # Build scripts
├── lumenis/           # Core Lumenis modules
│   ├── modules/       # Voice, combo, council
│   ├── integrations/  # Steam, OBS
│   └── public/        # Dashboard UI
└── overlay/           # ISO customization
```

## License

- Lumenis Ultimate v7.0: MIT License
- BackBox Linux: GPL License

Built with Lumenis Gaming OS