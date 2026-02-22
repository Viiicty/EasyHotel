@echo off
chcp 65001 >nul
echo ========================================
echo EasyHotel Development Environment Startup Script
echo ========================================
echo.

echo [1/4] Checking Docker services...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running, please start Docker Desktop first
    pause
    exit /b 1
)
echo Docker services are running
echo.

echo [2/4] Starting Docker containers (Redis + PostgreSQL)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo Error: Failed to start Docker containers
    pause
    exit /b 1
)
echo Docker containers started successfully
echo.

echo [3/4] Waiting for database to be ready...
timeout /t 3 /nobreak >nul
echo.

echo [4/4] Starting Backend API service...
cd api
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)
echo.
echo Backend API service is starting...
echo Please run the following commands in new terminal windows to start Mini Program and PC Admin:
echo.
echo Mini Program:
echo   cd min
echo   npm install
echo   npm run dev:weapp
echo.
echo PC Admin:
echo   cd pc
echo   npm install
echo   npm start
echo.
echo ========================================
echo Startup Complete!
echo ========================================
echo.
echo Service URLs:
echo   - Backend API: http://localhost:3000
echo   - Redis: localhost:6379
echo   - PostgreSQL: localhost:5432
echo.
echo Press Ctrl+C to stop backend service
echo.

call npm run start:dev