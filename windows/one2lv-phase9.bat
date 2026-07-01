@echo off
REM ============================================================================
REM One2lvOS Phase 9 - Windows 11 CMD Launcher
REM (Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors
REM ============================================================================

setlocal EnableDelayedExpansion
title One2lvOS Phase 9 - Windows 11

set "PHASE9_ROOT=%~dp0.."
set "OPT_PATH=%PHASE9_ROOT%\opt\one2lv"
set "MEMORY_DIR=%OPT_PATH%\memory"
set "VECTOR_DIR=%OPT_PATH%\vector"
set "LOGS_DIR=%OPT_PATH%\logs"
set "MODULES_DIR=%OPT_PATH%\modules"
set "UI_PORT=8080"
set "WS_PORT=8081"

cls
echo.
echo ========================================================================
echo    One2lvOS Phase 9 - Full Autonomous Delta Engine
echo    Windows 11 Edition
echo    (Delta9) 9-Layer Delta Engine ^| (Cubed) 3D Vectors
echo ========================================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo Or run: powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
echo [OK] Node.js detected: %NODE_VERSION%

echo [*] Initializing directories...
if not exist "%MEMORY_DIR%" mkdir "%MEMORY_DIR%"
if not exist "%VECTOR_DIR%" mkdir "%VECTOR_DIR%"
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
if not exist "%MODULES_DIR%" mkdir "%MODULES_DIR%"

if not exist "%MEMORY_DIR%\memory.json" (
    echo {"nodes":[],"beliefs":[],"goals":[],"patterns":[],"links":[]} > "%MEMORY_DIR%\memory.json"
    echo [OK] Created memory file
)

if not exist "%VECTOR_DIR%\vectors.json" (
    echo [] > "%VECTOR_DIR%\vectors.json"
)

echo.
echo [*] Starting Phase 9 services...
echo     (Cubed) 3D Vector Engine
echo     (Delta) 9-Layer Delta Stack
echo.

echo     [Web] Dashboard (HTTP :%UI_PORT%, WebSocket :%WS_PORT%)...
start "One2lvOS-UI" /MIN cmd /c "cd /d %OPT_PATH% && node ui\server.js > %LOGS_DIR%\ui.log 2>&1"

echo     [AI] Council (autonomous)...
start "One2lvOS-Council" /MIN cmd /c "cd /d %OPT_PATH% && node ai\council\council.js > %LOGS_DIR%\council.log 2>&1"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================================
echo    One2lvOS Phase 9 Running on Windows 11!
echo ========================================================================
echo.
echo    Dashboard:    http://localhost:%UI_PORT%
echo    WebSocket:    ws://localhost:%WS_PORT%
echo.
echo    Phase 9 Symbols:
echo    - (Cubed)  3D Vectors (x, y, z)
echo    - (++)     Amplify (x1.2)
echo    - (--)     Attenuate (x0.8)
echo    - (Delta)  Delta Gradient
echo    - (Delta9) 9-Layer Cap
echo.
echo    Logs:    %LOGS_DIR%
echo.
echo    Opening browser...
echo    Press Ctrl+C in the service windows to stop.
echo ========================================================================
echo.

start "" "http://localhost:%UI_PORT%"

echo.
echo Service windows are running. Close them to stop One2lvOS.
echo.
pause