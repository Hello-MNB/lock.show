@echo off
echo =========================================
echo LOCK website-next — first-time setup
echo =========================================
cd /d "%~dp0"
echo Installing packages (takes ~60 seconds)...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed. Check Node.js is installed.
  pause
  exit /b 1
)
echo.
echo Running build verification...
call npm run build
if errorlevel 1 (
  echo ERROR: Build failed. Check output above.
  pause
  exit /b 1
)
echo.
echo =========================================
echo PHASE 0 COMPLETE — report back to Claude
echo =========================================
pause
