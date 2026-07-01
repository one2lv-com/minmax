# ============================================================================
# One2lvOS Phase 9 - Windows 11 PowerShell Launcher
# (Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors
# ============================================================================

$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = "One2lvOS Phase 9 - Windows 11"

# Configuration
$One2LvRoot = if ($env:ONE2LV_ROOT) { $env:ONE2LV_ROOT } else { Join-Path $env:LOCALAPPDATA "One2lvOS" }
$Phase9Root = $PSScriptRoot | Split-Path -Parent
$OptPath = Join-Path $Phase9Root "opt\one2lv"
$MemoryDir = Join-Path $OptPath "memory"
$VectorDir = Join-Path $OptPath "vector"
$LogsDir = Join-Path $OptPath "logs"
$ModulesDir = Join-Path $OptPath "modules"
$UiPort = if ($env:UI_PORT) { $env:UI_PORT } else { 8080 }
$WsPort = if ($env:WS_PORT) { $env:WS_PORT } else { 8081 }

function Write-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "   One2lvOS Phase 9 - Full Autonomous Delta Engine" -ForegroundColor White
    Write-Host "   Windows 11 Edition" -ForegroundColor Yellow
    Write-Host "   (Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors" -ForegroundColor Magenta
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-NodeInstalled {
    try {
        $nodeVersion = node --version
        Write-Host "[OK] Node.js detected: $nodeVersion" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
        Write-Host "  Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "  Or run: .\windows\install.ps1" -ForegroundColor Yellow
        return $false
    }
}

function Initialize-Directories {
    Write-Host "[*] Initializing directories..." -ForegroundColor Cyan

    @($MemoryDir, $VectorDir, $LogsDir, $ModulesDir) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
    }

    $memoryFile = Join-Path $MemoryDir "memory.json"
    if (-not (Test-Path $memoryFile)) {
        $initialMemory = @{
            nodes = @()
            beliefs = @()
            goals = @()
            patterns = @()
            links = @()
        } | ConvertTo-Json -Depth 10
        Set-Content -Path $memoryFile -Value $initialMemory -Encoding UTF8
        Write-Host "[OK] Created memory file" -ForegroundColor Green
    }

    $vectorFile = Join-Path $VectorDir "vectors.json"
    if (-not (Test-Path $vectorFile)) {
        Set-Content -Path $vectorFile -Value "[]" -Encoding UTF8
    }

    $tokenFile = Join-Path $OptPath "core\token.key"
    if (-not (Test-Path $tokenFile)) {
        $tokenBytes = New-Object byte[] 32
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($tokenBytes)
        $token = [System.Convert]::ToBase64String($tokenBytes)
        Set-Content -Path $tokenFile -Value $token -Encoding UTF8
        Write-Host "[OK] Generated security token" -ForegroundColor Green
    }
}

function Start-Services {
    Write-Host ""
    Write-Host "[*] Starting Phase 9 services..." -ForegroundColor Cyan
    Write-Host "    (Cubed) 3D Vector Engine" -ForegroundColor Magenta
    Write-Host "    (Delta) 9-Layer Delta Stack" -ForegroundColor Magenta
    Write-Host ""

    $uiLog = Join-Path $LogsDir "ui.log"
    $councilLog = Join-Path $LogsDir "council.log"

    Write-Host "    [Web] Dashboard (HTTP :$UiPort, WebSocket :$WsPort)..." -ForegroundColor Yellow
    $uiProcess = Start-Process -FilePath "node" `
        -ArgumentList "ui\server.js" `
        -WorkingDirectory $OptPath `
        -RedirectStandardOutput $uiLog `
        -RedirectStandardError "$uiLog.err" `
        -PassThru -NoNewWindow

    Write-Host "    [AI] Council (autonomous)..." -ForegroundColor Yellow
    $councilProcess = Start-Process -FilePath "node" `
        -ArgumentList "ai\council\council.js" `
        -WorkingDirectory $OptPath `
        -RedirectStandardOutput $councilLog `
        -RedirectStandardError "$councilLog.err" `
        -PassThru -NoNewWindow

    Start-Sleep -Seconds 2

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "   One2lvOS Phase 9 Running on Windows 11!" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Dashboard:    http://localhost:$UiPort" -ForegroundColor Cyan
    Write-Host "   WebSocket:    ws://localhost:$WsPort" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Phase 9 Symbols:" -ForegroundColor Yellow
    Write-Host "   - (Cubed)  3D Vectors (x, y, z)" -ForegroundColor White
    Write-Host "   - (++)     Amplify (x1.2)" -ForegroundColor White
    Write-Host "   - (--)     Attenuate (x0.8)" -ForegroundColor White
    Write-Host "   - (Delta)  Delta Gradient" -ForegroundColor White
    Write-Host "   - (Delta9) 9-Layer Cap" -ForegroundColor White
    Write-Host ""
    Write-Host "   Logs:    $LogsDir" -ForegroundColor Gray
    Write-Host "   UI PID:  $($uiProcess.Id)" -ForegroundColor Gray
    Write-Host "   Council: $($councilProcess.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""

    Start-Process "http://localhost:$UiPort"

    $null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
        Get-Process node -ErrorAction SilentlyContinue | Where-Object {
            $_.MainWindowTitle -match "One2lvOS" -or $_.Id -eq $uiProcess.Id -or $_.Id -eq $councilProcess.Id
        } | Stop-Process -Force
    }

    try {
        Wait-Process -Id $uiProcess.Id, $councilProcess.Id -ErrorAction SilentlyContinue
    } catch {
        Write-Host "[*] Services stopped." -ForegroundColor Yellow
    }
}

Write-Banner

if (-not (Test-NodeInstalled)) {
    exit 1
}

Initialize-Directories
Start-Services