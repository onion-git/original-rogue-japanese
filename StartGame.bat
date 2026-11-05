@echo off
setlocal
cd /d "%~dp0"
title Rogue Game

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from nodejs.org and try again.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo First run: installing game files. Please wait...
  call npm.cmd install
  if errorlevel 1 (
    echo Setup failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo Starting the game. Close this window to stop it.
call npm.cmd run dev -- --open
if errorlevel 1 pause
endlocal
