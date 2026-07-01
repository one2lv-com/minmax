# ============================================================================
# One2lvOS Phase 9 - Windows Build Script
# Creates portable ZIP and Inno Setup installer packages
# ============================================================================

param(
    [switch]$Portable = $false,
    [switch]$Installer = $false,
    [switch]$All = $false,
    [string]$OutputDir = ""
)

$ErrorActionPreference = 'Stop'

$ProjectRoot = $PSScriptRoot | Split-Path -Parent | Split-Path -Parent
$OutputPath = if ($OutputDir) { $OutputDir } else { Join-Path $ProjectRoot "dist\windows" }
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Version = "9.0.0"

if ($All) { $Portable = $true; $Installer = $true }
if (-not $Portable -and -not $Installer) {
    Write-Host "[*] Building all artifacts..." -ForegroundColor Cyan
    $Portable = $true; $Installer = $true
}

function Write-Banner {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "   One2lvOS Phase 9 - Windows Build System" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function New-PortablePackage {
    Write-Host "[*] Building portable ZIP package..." -ForegroundColor Cyan

    $stagingDir = Join-Path $env:TEMP "one2lv-portable-$Timestamp"
    $portableName = "One2lvOS-Phase9-v$Version-Windows-Portable"
    $portableStaging = Join-Path $stagingDir $portableName

    New-Item -ItemType Directory -Path $portableStaging -Force | Out-Null

    Write-Host "    Copying application files..." -ForegroundColor Gray
    $excludeDirs = @('node_modules', '.git', 'dist', 'iso-build', 'interplanetary-disk', 'backbox-gaming-iso', 'one2lvos_export')

    Get-ChildItem -Path $ProjectRoot -Force | Where-Object {
        $_.Name -notin $excludeDirs -and -not $_.Name.StartsWith('.')
    } | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $portableStaging -Recurse -Force
    }

    if (Test-Path (Join-Path $ProjectRoot "opt\one2lv")) {
        $optDest = Join-Path $portableStaging "opt\one2lv"
        New-Item -ItemType Directory -Path $optDest -Force | Out-Null
        Get-ChildItem -Path (Join-Path $ProjectRoot "opt\one2lv") -Force | Where-Object {
            $_.Name -ne 'node_modules'
        } | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $optDest -Recurse -Force
        }
    }

    @("opt\one2lv\memory", "opt\one2lv\vector", "opt\one2lv\logs") | ForEach-Object {
        $dir = Join-Path $portableStaging $_
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        New-Item -ItemType File -Path (Join-Path $dir ".gitkeep") -Force | Out-Null
    }

    $readmePath = Join-Path $portableStaging "PORTABLE-README.txt"
    @"
One2lvOS Phase 9 - Portable Edition
====================================
Version: $Version
Build:   $Timestamp

QUICK START:
1. Extract this ZIP to any folder
2. Make sure Node.js 18+ is installed
3. Run 'one2lv-phase9.bat' to launch

FOR DEVELOPERS:
- Use 'windows\launch.ps1' for PowerShell
- Use 'one2lv' CLI tool for management
- Run 'windows\install.ps1' to install dependencies

DASHBOARD:
- http://localhost:8080
- WebSocket: ws://localhost:8081

GitHub: https://github.com/one2lv-com/minmax
"@ | Set-Content -Path $readmePath

    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }

    $zipPath = Join-Path $OutputPath "$portableName.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($portableStaging, $zipPath)

    Remove-Item $stagingDir -Recurse -Force -ErrorAction SilentlyContinue

    $size = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host "[OK] Portable ZIP created: $zipPath ($size MB)" -ForegroundColor Green
}

function New-InstallerPackage {
    Write-Host "[*] Building Windows installer (Inno Setup)..." -ForegroundColor Cyan

    $isccPath = $null
    $isccPaths = @(
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 6\ISCC.exe",
        "${env:LOCALAPPDATA}\Programs\Inno Setup 6\ISCC.exe"
    )

    foreach ($path in $isccPaths) {
        if (Test-Path $path) {
            $isccPath = $path
            break
        }
    }

    if (-not $isccPath) {
        Write-Host "[!] Inno Setup not found. Download from: https://jrsoftware.org/isinfo.php" -ForegroundColor Yellow
        Write-Host "    Installer script: windows\installer\one2lvos-phase9.iss" -ForegroundColor Gray
        return
    }

    $issFile = Join-Path $ProjectRoot "windows\installer\one2lvos-phase9.iss"
    if (-not (Test-Path $issFile)) {
        Write-Host "[ERROR] Installer script not found: $issFile" -ForegroundColor Red
        return
    }

    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }

    & $isccPath "/dMyAppVersion=$Version" "/o$OutputPath" $issFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Installer built successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Installer build failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
    }
}

Write-Banner

Write-Host "Version:    $Version" -ForegroundColor White
Write-Host "Timestamp:  $Timestamp" -ForegroundColor White
Write-Host "Output:     $OutputPath" -ForegroundColor White
Write-Host ""

if ($Portable) { New-PortablePackage }
if ($Installer) { New-InstallerPackage }

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "   Build Complete!" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Green
Write-Host "Output: $OutputPath" -ForegroundColor Cyan
Write-Host ""
Get-ChildItem $OutputPath -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "One2lvOS*" } | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  $($_.Name) ($size MB)" -ForegroundColor White
}
Write-Host ""