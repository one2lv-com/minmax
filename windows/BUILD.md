# One2lvOS Phase 9 - Windows 11 Build System

This directory contains the complete Windows 11 build infrastructure for One2lvOS Phase 9.

## Directory Layout

```
windows/
├── WINDOWS-README.md           # Main Windows documentation
├── BUILD.md                    # This file - build instructions
├── launch.ps1                  # PowerShell launcher
├── install.ps1                 # PowerShell installer (auto-installs Node.js)
├── one2lv-phase9.bat           # CMD-compatible launcher
├── scripts/
│   ├── one2lv.ps1              # CLI management tool (`one2lv` command)
│   └── build-windows.ps1       # Build script for ZIP/installer
├── installer/
│   └── one2lvos-phase9.iss     # Inno Setup installer definition
└── resources/
    └── README.md               # Asset requirements
```

## Building on Windows

### Prerequisites

1. **Windows 10/11** (x64)
2. **Node.js 18+** ([download](https://nodejs.org/))
3. **PowerShell 5.1+** (built-in)
4. **Inno Setup 6+** (only for building installers)
   - Download: https://jrsoftware.org/isinfo.php
5. **Git** (optional, for source updates)

### Build Commands

```powershell
# Navigate to project
cd C:\path\to\one2lvos

# Build portable ZIP
npm run build:portable

# Build Windows installer (.exe)
npm run build:installer

# Build both
npm run build:all
```

### Output

Build artifacts go to `dist\windows\`:

```
dist\windows\
├── One2lvOS-Phase9-v9.0.0-Windows-Portable.zip   # Portable ZIP
└── One2lvOS-Phase9-v9.0.0-Windows-Setup.exe      # Inno Setup installer
```

## What Gets Built

### 1. Portable ZIP (`One2lvOS-Phase9-v9.0.0-Windows-Portable.zip`)

A no-installation ZIP that contains:
- Complete `opt\one2lv\` Phase 9 system
- All `windows\` scripts (launchers, installer, CLI tool)
- README and documentation
- Empty placeholder directories for memory/vectors/logs

**Usage:**
1. Extract to any folder
2. Run `windows\one2lv-phase9.bat` or `windows\launch.ps1`
3. Browser opens automatically to dashboard

### 2. Windows Installer (`One2lvOS-Phase9-v9.0.0-Windows-Setup.exe`)

A professional installer built with Inno Setup that:
- Installs to `C:\Program Files\One2lvOS\` (or custom location)
- Creates Start Menu shortcuts
- Optionally creates Desktop shortcuts
- Runs dependency installer
- Adds uninstaller to Settings → Apps

## Testing Locally

Before building installers, test the scripts:

```powershell
# Test launcher (will start services and open browser)
.\windows\launch.ps1

# Test CLI tool
.\windows\scripts\one2lv.ps1 status
.\windows\scripts\one2lv.ps1 start
.\windows\scripts\one2lv.ps1 stop
.\windows\scripts\one2lv.ps1 logs ui

# Test installer script (without admin)
.\windows\install.ps1
```

## Cross-Platform Considerations

The Windows scripts are designed to mirror the Linux experience:

| Feature | Linux | Windows |
|---------|-------|---------|
| Launcher | `bash launch.sh` | `.\windows\launch.ps1` |
| Install | `./builder/quick-run.sh install` | `.\windows\install.ps1` |
| CLI tool | `one2lv` (bash) | `one2lv.ps1` (PowerShell) |
| Data dir | `/opt/one2lv/` | `%LOCALAPPDATA%\One2lvOS\` |
| Logs | `/opt/one2lv/logs/` | `%LOCALAPPDATA%\One2lvOS\logs\` |

The Node.js core (`opt/one2lv/`) is **identical** on all platforms — only the deployment layer differs.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Windows
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Inno Setup
        run: choco install innosetup -y
      - name: Build artifacts
        run: .\windows\scripts\build-windows.ps1 -All
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: dist/windows/*
```

## Troubleshooting

### Build Errors

**"Cannot find ISCC.exe"**
- Install Inno Setup 6: https://jrsoftware.org/isinfo.php

**"Access denied" during ZIP creation**
- Close any open files in the staging directory
- Run PowerShell as Administrator

**"Node.js not found" during build**
- Install Node.js 18+ and ensure it's in PATH

### Runtime Errors

**"Port 8080 already in use"**
- Check `netstat -ano | findstr :8080`
- Change port: `$env:UI_PORT = 9090` before launching

**"Permission denied" on data directory**
- Ensure `%LOCALAPPDATA%\One2lvOS` is writable

**PowerShell Execution Policy**
```powershell
# Allow scripts for current user
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Or bypass for single command
powershell -ExecutionPolicy Bypass -File script.ps1
```

## Versioning

The build uses semantic versioning from `package.json`. To bump the version:

```powershell
# Manual - edit package.json: "version": "9.0.0"

# Or with npm
npm version patch   # 9.0.0 → 9.0.1
npm version minor   # 9.0.0 → 9.1.0
npm version major   # 9.0.0 → 10.0.0
```

## License

MIT © One2lvOS

## Links

- Main repo: https://github.com/one2lv-com/minmax
- Windows README: [WINDOWS-README.md](WINDOWS-README.md)
- Issues: https://github.com/one2lv-com/minmax/issues