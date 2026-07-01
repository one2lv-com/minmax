# ============================================================================
# One2lvOS Phase 9 - Windows 11 Installer
# (Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors
# ============================================================================

$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = "One2lvOS Phase 9 - Installer"

function Write-Banner {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "   One2lvOS Phase 9 - Windows 11 Installer" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Administrator {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-NodeJS {
    Write-Host "[*] Checking for Node.js 18+..." -ForegroundColor Cyan

    try {
        $version = node --version
        $majorVersion = [int]($version -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -ge 18) {
            Write-Host "[OK] Node.js $version found" -ForegroundColor Green
            return $true
        }
    } catch {}

    Write-Host "[!] Node.js 18+ not detected" -ForegroundColor Yellow
    Write-Host "[*] Downloading Node.js LTS..." -ForegroundColor Cyan

    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $installerPath = Join-Path $env:TEMP "node-installer.msi"

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
    } catch {
        Write-Host "[ERROR] Failed to download Node.js: $_" -ForegroundColor Red
        return $false
    }

    Write-Host "[*] Installing Node.js (silent)..." -ForegroundColor Cyan
    $msiArgs = "/i `"$installerPath`" /qn ADDLOCAL=ALL"
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $msiArgs -Wait -PassThru

    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

    if ($process.ExitCode -eq 0) {
        Write-Host "[OK] Node.js installed" -ForegroundColor Green
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        return $true
    } else {
        Write-Host "[ERROR] Node.js installation failed" -ForegroundColor Red
        return $false
    }
}

function Install-NpmDependencies {
    param([string]$WorkingDir)

    Write-Host "[*] Installing npm dependencies..." -ForegroundColor Cyan

    $originalDir = Get-Location
    Set-Location $WorkingDir

    try {
        npm install --no-audit --no-fund --loglevel=error
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Dependencies installed" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[ERROR] npm install failed" -ForegroundColor Red
            return $false
        }
    } finally {
        Set-Location $originalDir
    }
}

function Create-DesktopShortcut {
    param([string]$TargetPath, [string]$ShortcutName)

    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktop "$ShortcutName.lnk"

    $wscript = New-Object -ComObject WScript.Shell
    $shortcut = $wscript.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$TargetPath`""
    $shortcut.WorkingDirectory = (Split-Path $TargetPath -Parent)
    $shortcut.IconLocation = "powershell.exe,0"
    $shortcut.Description = "One2lvOS Phase 9 - Autonomous Delta Engine"
    $shortcut.Save()

    Write-Host "[OK] Created desktop shortcut: $shortcutPath" -ForegroundColor Green
}

function Create-StartMenuEntry {
    $startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
    $one2lvFolder = Join-Path $startMenu "One2lvOS"

    if (-not (Test-Path $one2lvFolder)) {
        New-Item -ItemType Directory -Path $one2lvFolder -Force | Out-Null
    }

    $launchShortcut = Join-Path $one2lvFolder "One2lvOS Phase 9.lnk"

    $wscript = New-Object -ComObject WScript.Shell

    $shortcut = $wscript.CreateShortcut($launchShortcut)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$PSScriptRoot\launch.ps1`""
    $shortcut.WorkingDirectory = $PSScriptRoot
    $shortcut.IconLocation = "powershell.exe,0"
    $shortcut.Save()

    Write-Host "[OK] Created Start Menu entry" -ForegroundColor Green
}

Write-Banner

$isAdmin = Test-Administrator
if (-not $isAdmin) {
    Write-Host "[!] Not running as Administrator" -ForegroundColor Yellow
    Write-Host "    Some features may require elevation." -ForegroundColor Yellow
}

if (-not (Install-NodeJS)) {
    Write-Host ""
    Write-Host "[ERROR] Installation cannot continue without Node.js" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ manually from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$projectRoot = Split-Path $PSScriptRoot -Parent
Write-Host "[*] Installing One2lvOS dependencies..." -ForegroundColor Cyan
Install-NpmDependencies -WorkingDir $projectRoot | Out-Null

$optPath = Join-Path $projectRoot "opt\one2lv"
if (Test-Path $optPath) {
    Write-Host "[*] Installing Phase 9 core dependencies..." -ForegroundColor Cyan
    Install-NpmDependencies -WorkingDir $optPath | Out-Null
}

Write-Host ""
Write-Host "[*] Creating shortcuts..." -ForegroundColor Cyan
try {
    Create-DesktopShortcut -TargetPath "$PSScriptRoot\launch.ps1" -ShortcutName "One2lvOS Phase 9"
    Create-StartMenuEntry
} catch {
    Write-Host "[!] Could not create shortcuts: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "   Installation Complete!" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "   To launch:" -ForegroundColor Yellow
Write-Host "   - Double-click the desktop shortcut" -ForegroundColor White
Write-Host "   - Or run: powershell -File windows\launch.ps1" -ForegroundColor White
Write-Host "   - Or use Start Menu: One2lvOS > One2lvOS Phase 9" -ForegroundColor White
Write-Host ""
Write-Host "   Default ports:" -ForegroundColor Yellow
Write-Host "   - Dashboard: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   - WebSocket: ws://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Resonating with Phase 9..." -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")