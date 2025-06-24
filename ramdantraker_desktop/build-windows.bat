@echo off
echo Building Ramadan Tracker Desktop App for Windows...
cd /d "%~dp0"
npm run build:win
echo Build completed! Check the dist folder for the installer.
pause 