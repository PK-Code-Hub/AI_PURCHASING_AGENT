@echo off
echo ===================================================
echo  Starting AegisProcure AI Purchasing Agent
echo ===================================================

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "AegisProcure Backend" cmd /k ".\venv\Scripts\python.exe backend\main.py"

echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
cd frontend
start "AegisProcure Frontend" cmd /k "npm run dev"

echo.
echo AegisProcure AI services are launching!
echo Access the web console at: http://localhost:5173
echo ===================================================
