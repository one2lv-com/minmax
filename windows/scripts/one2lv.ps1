# ============================================================================
# One2lvOS Phase 9 - Windows CLI Tool
# Command-line interface for managing One2lvOS on Windows 11
# ============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'status', 'restart', 'logs', 'update', 'uninstall', 'help', 'version')]
    [string]$Command = 'help',

    [Parameter(Position=1)]
    [string]$Argument = ''
)

$ErrorActionPreference = 'Continue'

$Phase9Root = $PSScriptRoot | Split-Path -Parent | Split-Path -Parent
$OptPath = Join-Path $Phase9Root "opt\one2lv"
$LogsDir = Join-Path $OptPath "logs"
$UiPort = if ($env:UI_PORT) { $env:UI_PORT } else { 8080 }
$WsPort = if ($env:WS_PORT) { $env:WS_PORT } else { 8081 }

function Show-Help {
    Write-Host ""
    Write-Host "One2lvOS Phase 9 - Windows CLI" -ForegroundColor Cyan
    Write-Host "(Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: one2lv <command> [arguments]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start       Start One2lvOS Phase 9 services" -ForegroundColor White
    Write-Host "  stop        Stop One2lvOS Phase 9 services" -ForegroundColor White
    Write-Host "  status      Show current status" -ForegroundColor White
    Write-Host "  restart     Restart all services" -ForegroundColor White
    Write-Host "  logs        Tail logs (ui or council)" -ForegroundColor White
    Write-Host "  update      Update from GitHub" -ForegroundColor White
    Write-Host "  uninstall   Remove One2lvOS" -ForegroundColor White
    Write-Host "  version     Show version info" -ForegroundColor White
    Write-Host "  help        Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  one2lv start" -ForegroundColor Gray
    Write-Host "  one2lv logs ui" -ForegroundColor Gray
    Write-Host "  one2lv status" -ForegroundColor Gray
    Write-Host ""
}

function Get-Status {
    Write-Host ""
    Write-Host "One2lvOS Phase 9 Status" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""

    try {
        $nodeVer = node --version
        Write-Host "  Node.js:    $nodeVer" -ForegroundColor Green
    } catch {
        Write-Host "  Node.js:    NOT FOUND" -ForegroundColor Red
    }

    $uiProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        try { $_.MainModule.FileName -like "*node.exe*" } catch { $false }
    }

    $runningCount = 0
    if ($uiProcess) {
        $runningCount = $uiProcess.Count
        if ($runningCount -is [int]) { $runningCount = 1 }
    }

    Write-Host "  Services:   $runningCount node process(es)" -ForegroundColor $(if ($runningCount -gt 0) { "Green" } else { "Yellow" })
    Write-Host "  UI Port:    $UiPort" -ForegroundColor White
    Write-Host "  WS Port:    $WsPort" -ForegroundColor White
    Write-Host "  Install:    $Phase9Root" -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$UiPort/api/status" -UseBasicParsing -TimeoutSec 3
        Write-Host "  Dashboard:  ONLINE ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  Dashboard:  OFFLINE" -ForegroundColor Yellow
    }

    Write-Host ""
}

function Start-One2lvOS {
    Write-Host "[*] Starting One2lvOS Phase 9..." -ForegroundColor Cyan

    $existing = Get-NetTCPConnection -LocalPort $UiPort -State Listen -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "[!] One2lvOS is already running on port $UiPort" -ForegroundColor Yellow
        Write-Host "    Use 'one2lv restart' to restart it" -ForegroundColor Yellow
        return
    }

    @("memory", "vector", "logs") | ForEach-Object {
        $dir = Join-Path $OptPath $_
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }

    $uiProcess = Start-Process -FilePath "node" `
        -ArgumentList "ui\server.js" `
        -WorkingDirectory $OptPath `
        -RedirectStandardOutput (Join-Path $LogsDir "ui.log") `
        -RedirectStandardError (Join-Path $LogsDir "ui.err") `
        -PassThru -NoNewWindow

    $councilProcess = Start-Process -FilePath "node" `
        -ArgumentList "ai\council\council.js" `
        -WorkingDirectory $OptPath `
        -RedirectStandardOutput (Join-Path $LogsDir "council.log") `
        -RedirectStandardError (Join-Path $LogsDir "council.err") `
        -PassThru -NoNewWindow

    Start-Sleep -Seconds 2
    Write-Host "[OK] Services started" -ForegroundColor Green
    Write-Host "    UI PID:      $($uiProcess.Id)" -ForegroundColor Gray
    Write-Host "    Council PID: $($councilProcess.Id)" -ForegroundColor Gray
    Write-Host "    Dashboard:   http://localhost:$UiPort" -ForegroundColor Cyan
}

function Stop-One2lvOS {
    Write-Host "[*] Stopping One2lvOS Phase 9..." -ForegroundColor Cyan

    $killed = 0
    Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdLine -match "one2lv|opt\\one2lv") {
                Write-Host "    Stopping PID $($_.Id)..." -ForegroundColor Gray
                Stop-Process -Id $_.Id -Force
                $killed++
            }
        } catch {}
    }

    if ($killed -eq 0) {
        Write-Host "[!] No One2lvOS processes found" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Stopped $killed process(es)" -ForegroundColor Green
    }
}

function Show-Logs {
    param([string]$Service)

    $logFile = if ($Service -eq 'council') {
        Join-Path $LogsDir "council.log"
    } else {
        Join-Path $LogsDir "ui.log"
    }

    if (-not (Test-Path $logFile)) {
        Write-Host "[!] Log file not found: $logFile" -ForegroundColor Yellow
        return
    }

    Write-Host "[*] Tailing $logFile (Ctrl+C to exit)..." -ForegroundColor Cyan
    Get-Content $logFile -Wait -Tail 50
}

function Update-One2lvOS {
    Write-Host "[*] Updating from GitHub..." -ForegroundColor Cyan

    Push-Location $Phase9Root
    try {
        git pull origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Updated successfully" -ForegroundColor Green
            Write-Host "[*] Reinstalling dependencies..." -ForegroundColor Cyan
            npm install --no-audit --no-fund
            Write-Host "[OK] Update complete" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Update failed" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
}

function Show-Version {
    $packageJson = Get-Content (Join-Path $Phase9Root "package.json") -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
    Write-Host ""
    Write-Host "One2lvOS Phase 9" -ForegroundColor Cyan
    Write-Host "Version: $($packageJson.version)" -ForegroundColor White
    Write-Host "Node:    $(node --version 2>$null)" -ForegroundColor Gray
    Write-Host "Install: $Phase9Root" -ForegroundColor Gray
    Write-Host ""
}

switch ($Command) {
    'start'     { Start-One2lvOS }
    'stop'      { Stop-One2lvOS }
    'status'    { Get-Status }
    'restart'   { Stop-One2lvOS; Start-Sleep -Seconds 2; Start-One2lvOS }
    'logs'      { Show-Logs -Service $Argument }
    'update'    { Update-One2lvOS }
    'uninstall' { Write-Host "Use Windows Settings > Apps to uninstall" -ForegroundColor Yellow }
    'version'   { Show-Version }
    'help'      { Show-Help }
    default     { Show-Help }
}