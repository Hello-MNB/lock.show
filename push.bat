@echo off
cd /d C:\Users\user\GIGPROOF
echo Aborting any incomplete merge...
git merge --abort 2>nul
echo.
echo Pulling remote changes first...
git pull --no-edit origin main
echo.
echo Pushing local commits...
git push origin main
echo.
pause
