# One2lvOS Phase 9 - Windows 11 Edition

> **Autonomous Delta Engine for Windows 11**
> ∆⁹ 9-Layer Gradient Stack | ³ 3D Vector Mathematics

This is the **Windows 11 native build** of One2lvOS Phase 9. It provides all the power of the Linux version with Windows-specific tooling, installers, and PowerShell integration.

## Quick Start

### Option 1: Portable (No Installation)

1. Download `One2lvOS-Phase9-v9.0.0-Windows-Portable.zip`
2. Extract to any folder (e.g., `C:\One2lvOS\`)
3. Make sure **Node.js 18+** is installed ([download](https://nodejs.org/))
4. Double-click `windows\one2lv-phase9.bat`

### Option 2: Installer (Recommended)

1. Download `One2lvOS-Phase9-v9.0.0-Windows-Setup.exe`
2. Run the installer as Administrator
3. Choose installation directory and shortcuts
4. Launch from desktop or Start Menu

### Option 3: Manual Install

```powershell
# Run from PowerShell as Administrator
cd path\to\one2lvos
.\windows\install.ps1
.\windows\launch.ps1
```

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Windows 10 (1809+) | Windows 11 |
| Architecture | x64 | x64 |
| RAM | 1 GB | 2 GB |
| Disk | 500 MB | 1 GB |
| Node.js | 18.x | 20.x LTS |
| PowerShell | 5.1 | 7.x |

## What's Included

### Windows-Specific Components

| File | Purpose |
|------|---------|
| `windows\launch.ps1` | PowerShell launcher with Windows-native features |
| `windows\install.ps1` | One-click installer (auto-installs Node.js if needed) |
| `windows\one2lv-phase9.bat` | CMD-compatible launcher |
| `windows\scripts\one2lv.ps1` | Command-line management tool |
| `windows\scripts\build-windows.ps1` | Build portable/installer packages |
| `windows\installer\one2lvos-phase9.iss` | Inno Setup installer script |

### Command-Line Tool (`one2lv`)

The `one2lv` command provides complete management from any terminal:

```powershell
one2lv start           # Start One2lvOS services
one2lv stop            # Stop all services
one2lv status          # Show running status
one2lv restart         # Restart everything
one2lv logs ui         # Tail UI service logs
one2lv logs council    # Tail Council service logs
one2lv update          # Pull latest from GitHub
one2lv version         # Show version info
one2lv help            # Show help
```

## Windows-Specific Features

### 1. Native Path Handling
- Uses Windows paths (`C:\Users\...`, `\` separators)
- Stores data in `%LOCALAPPDATA%\One2lvOS`
- Environment variables via `$env:` PowerShell syntax

### 2. Windows Process Integration
- Background processes via `Start-Process -NoNewWindow`
- Proper signal handling for graceful shutdown
- Task Manager-friendly process names

### 3. PowerShell 5.1+ Compatible
- All scripts use approved PowerShell verbs
- ExecutionPolicy-aware (auto-requests bypass)

### 4. Windows Installer Features
- UAC-aware (requests elevation when needed)
- Per-user vs per-machine installation
- Start Menu and Desktop shortcut creation
- Proper uninstallation via Settings → Apps

### 5. Browser Auto-Open
- Launches `http://localhost:8080` automatically
- Works with Edge, Chrome, Firefox, or default browser

## Architecture on Windows

```
C:\Program Files\One2lvOS\
├── opt\one2lv\              # Phase 9 Core System
│   ├── modules\
│   │   ├── system_dynamics.js    # ³ 3D Vector Engine
│   │   └── delta_engine.js       # ∆⁹ 9-Layer Delta
│   ├── ai\council\               # Multi-agent council
│   ├── mesh\                     # Secure RPC + Discovery
│   ├── sandbox\                  # Capability sandbox
│   ├── vector\                   # Vector database
│   ├── ui\                       # Dashboard server
│   ├── memory\                   # Persistent memory
│   └── logs\                     # Runtime logs
├── windows\                    # Windows-native scripts
├── README.md
├── LICENSE
└── package.json
```

## Phase 9 API on Windows

The Windows build exposes the **same Phase 9 API** as the Linux version:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System status |
| `/api/vector3d` | POST | Create 3D vector |
| `/api/delta/propagate` | POST | Propagate gradient |
| `/api/delta/amplify` | POST | Apply `++` |
| `/api/delta/attenuate` | POST | Apply `--` |
| `/api/delta/layer` | POST | Add delta layer |
| WebSocket `ws://localhost:8081` | - | Real-time updates |

## Building from Source

### Prerequisites
- Windows 10/11
- Node.js 18+ ([download](https://nodejs.org/))
- PowerShell 5.1+ (built into Windows)
- Git ([download](https://git-scm.com/))
- Inno Setup 6+ (only for installer builds)

### Build Steps

```powershell
# Clone the repository
git clone https://github.com/one2lv-com/minmax.git
cd minmax

# Install dependencies
npm install

# Build portable ZIP
.\windows\scripts\build-windows.ps1 -Portable

# Build Inno Setup installer
.\windows\scripts\build-windows.ps1 -Installer

# Build both
.\windows\scripts\build-windows.ps1 -All
```

Output goes to `dist\windows\`:

```
dist\windows\
├── One2lvOS-Phase9-v9.0.0-Windows-Portable.zip
└── One2lvOS-Phase9-v9.0.0-Windows-Setup.exe
```

## Troubleshooting

### "Node.js not found"
Install Node.js 18+ from https://nodejs.org/ or run `.\windows\install.ps1` (it can auto-install).

### "Execution Policy" error
PowerShell blocks unsigned scripts by default. Use:
```powershell
powershell -ExecutionPolicy Bypass -File .\windows\launch.ps1
```

### Port 8080 already in use
Change the port via environment variable:
```powershell
$env:UI_PORT = 9090
$env:WS_PORT = 9091
.\windows\launch.ps1
```

### Services won't stop
```powershell
# Force kill all One2lvOS processes
Get-Process node | Where-Object { $_.Path -like "*one2lv*" } | Stop-Process -Force

# Or use the CLI tool
.\windows\scripts\one2lv.ps1 stop
```

## Differences from Linux Build

| Feature | Linux | Windows |
|---------|-------|---------|
| Shell | bash | PowerShell + CMD |
| Path separator | `/` | `\` |
| Config dir | `/opt/one2lv` | `%LOCALAPPDATA%\One2lvOS` |
| Process model | Daemon + systemd | Background processes |
| Service control | `systemctl` | Task Scheduler / `one2lv` CLI |
| Package | .deb / .rpm / AppImage | .exe / .zip / Portable |

All **Phase 9 engine code is identical** between platforms — only the deployment layer differs.

## License

MIT © One2lvOS

## Links

- **GitHub**: https://github.com/one2lv-com/minmax
- **Issues**: https://github.com/one2lv-com/minmax/issues
- **Documentation**: See parent README.md for Phase 9 API reference

---

🌌 **One2lvOS Phase 9 - Windows 11 Edition**
∆⁹ 9-Layer Gradient | ³ 3D Vectors | ++ Amplify | -- Attenuate