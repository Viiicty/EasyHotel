@echo off
echo ========================================
echo EasyHotel 开发环境启动脚本
echo ========================================
echo.

echo [1/4] 检查 Docker 服务...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)
echo Docker 服务正常
echo.

echo [2/4] 启动 Docker 容器 (Redis + PostgreSQL)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo 错误: Docker 容器启动失败
    pause
    exit /b 1
)
echo Docker 容器启动成功
echo.

echo [3/4] 等待数据库就绪...
timeout /t 3 /nobreak >nul
echo.

echo [4/4] 启动后端 API 服务...
cd api
if not exist .env (
    echo 创建 .env 文件...
    copy .env.example .env
)
echo.
echo 后端 API 服务正在启动...
echo 请在新的终端窗口中运行以下命令启动小程序和 PC 管理端:
echo.
echo 小程序:
echo   cd min
echo   npm install
echo   npm run dev:weapp
echo.
echo PC 管理端:
echo   cd pc
echo   npm install
echo   npm start
echo.
echo ========================================
echo 启动完成！
echo ========================================
echo.
echo 服务地址:
echo   - 后端 API: http://localhost:3000
echo   - Redis: localhost:6379
echo   - PostgreSQL: localhost:5432
echo.
echo 按 Ctrl+C 停止后端服务
echo.

npm run start:dev
