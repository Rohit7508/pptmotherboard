@echo off
echo Starting local server for 3D Presentation...
start python -m http.server 8000
timeout /t 2 /nobreak >nul
start http://localhost:8000/index.html
echo Presentation opened in your browser!
