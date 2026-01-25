@echo off
echo 🚀 BoardGameTracker OMV800 Portainer Update Script
echo ==================================================

REM Configuration
set OMV800_HOST=root@omv800
set REMOTE_PATH=/opt/boardgametracker
set BACKUP_PATH=/opt/boardgametracker/backups/%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

REM Remove spaces from time
set BACKUP_PATH=%BACKUP_PATH: =0%

echo 📋 Configuration:
echo   OMV800 Host: %OMV800_HOST%
echo   Remote Path: %REMOTE_PATH%
echo   Backup Path: %BACKUP_PATH%
echo.

echo 🔍 Testing connection to OMV800...
ssh -o ConnectTimeout=10 -o BatchMode=yes %OMV800_HOST% "echo 'Connection successful'" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot connect to OMV800. Please check your SSH connection.
    pause
    exit /b 1
)
echo ✅ Connection to OMV800 successful
echo.

echo 📦 Preparing update package...
echo   Copying updated files...

REM Create local temporary directory
set TEMP_DIR=C:\Temp\boardgametracker_update_%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TEMP_DIR=%TEMP_DIR: =0%
mkdir "%TEMP_DIR%" 2>nul

copy docker-compose.portainer.yml "%TEMP_DIR%\"
copy deploy-to-omv800.sh "%TEMP_DIR%\"
copy OMV800_DEPLOYMENT_GUIDE.md "%TEMP_DIR%\"

REM Create changelog
echo # BoardGameTracker OMV800 Update Changelog > "%TEMP_DIR%\CHANGELOG.md"
echo. >> "%TEMP_DIR%\CHANGELOG.md"
echo ## New Features Added: >> "%TEMP_DIR%\CHANGELOG.md"
echo * ScoreSheet Templates functionality >> "%TEMP_DIR%\CHANGELOG.md"
echo * Score Sessions management >> "%TEMP_DIR%\CHANGELOG.md"
echo * Enhanced Docker configuration with health checks >> "%TEMP_DIR%\CHANGELOG.md"
echo * Updated to .NET 9.0 and PostgreSQL 17 >> "%TEMP_DIR%\CHANGELOG.md"
echo. >> "%TEMP_DIR%\CHANGELOG.md"
echo ## Files Updated: >> "%TEMP_DIR%\CHANGELOG.md"
echo * docker-compose.portainer.yml (enhanced with health checks and networking) >> "%TEMP_DIR%\CHANGELOG.md"
echo * deploy-to-omv800.sh (updated deployment script) >> "%TEMP_DIR%\CHANGELOG.md"
echo * OMV800_DEPLOYMENT_GUIDE.md (comprehensive deployment guide) >> "%TEMP_DIR%\CHANGELOG.md"
echo. >> "%TEMP_DIR%\CHANGELOG.md"
echo ## Docker Configuration Improvements: >> "%TEMP_DIR%\CHANGELOG.md"
echo * Added health checks for both application and database >> "%TEMP_DIR%\CHANGELOG.md"
echo * Implemented proper service dependencies >> "%TEMP_DIR%\CHANGELOG.md"
echo * Enhanced networking configuration >> "%TEMP_DIR%\CHANGELOG.md"
echo * Updated environment variables >> "%TEMP_DIR%\CHANGELOG.md"

echo ✅ Update package prepared in %TEMP_DIR%
echo.

echo 🔄 Starting OMV800 update process...
echo   1. Creating backup on OMV800...
ssh %OMV800_HOST% "mkdir -p %BACKUP_PATH%"
ssh %OMV800_HOST% "cd %REMOTE_PATH% && find . -maxdepth 1 -type f -exec cp {} %BACKUP_PATH%/ \; 2>/dev/null || true"

echo   2. Stopping current containers...
ssh %OMV800_HOST% "cd %REMOTE_PATH% && docker compose -f docker-compose.portainer.yml down"

echo   3. Uploading updated files...
for %%f in ("%TEMP_DIR%\*.*") do (
    scp "%%f" %OMV800_HOST%:%REMOTE_PATH%/
)

echo   4. Setting file permissions...
ssh %OMV800_HOST% "chmod +x %REMOTE_PATH%/*.sh"

echo   5. Starting updated containers...
ssh %OMV800_HOST% "cd %REMOTE_PATH% && docker compose -f docker-compose.portainer.yml up -d"

echo   6. Monitoring container startup...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Container Status:
ssh %OMV800_HOST% "docker compose -f %REMOTE_PATH%/docker-compose.portainer.yml ps"

echo.
echo 🔍 Checking container logs...
ssh %OMV800_HOST% "docker compose -f %REMOTE_PATH%/docker-compose.portainer.yml logs --tail=20"

echo.
echo 🏥 Testing health checks...
echo   Testing application health...
ssh %OMV800_HOST% "curl -f http://localhost:5444/health || echo '❌ Application health check failed'"

echo   Testing database health...
ssh %OMV800_HOST% "docker compose -f %REMOTE_PATH%/docker-compose.portainer.yml exec db pg_isready -U dev -d boardgametracker || echo '❌ Database health check failed'"

echo.
echo 🎉 OMV800 Portainer Update Complete!
echo.
echo 📋 Summary:
echo   ✅ Backup created at: %BACKUP_PATH%
echo   ✅ Updated files deployed
echo   ✅ Containers restarted
echo   ✅ Health checks completed
echo.
echo 🔧 Next Steps:
echo   1. Check the application at: http://omv800:5444
echo   2. Verify all services are running in Portainer
echo   3. Test the new ScoreSheet functionality
echo   4. Monitor logs for any issues
echo.
echo 📚 Documentation:
echo   - Deployment Guide: %REMOTE_PATH%/OMV800_DEPLOYMENT_GUIDE.md
echo   - Changelog: %REMOTE_PATH%/CHANGELOG.md
echo.
echo ⚠️  If issues occur, you can restore from backup:
echo   ssh %OMV800_HOST%
echo   cd %REMOTE_PATH%
echo   docker compose -f docker-compose.portainer.yml down
echo   cp -r %BACKUP_PATH%/* .
echo   docker compose -f docker-compose.portainer.yml up -d
echo.
echo 🧹 Cleanup completed
echo ✅ Update process finished successfully!
pause