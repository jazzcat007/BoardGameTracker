#!/usr/bin/env pwsh
# BoardGameTracker OMV800 Portainer Update Script (PowerShell Version)
# This script updates your OMV800 server with the latest changes

Write-Host "🚀 BoardGameTracker OMV800 Portainer Update Script" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configuration
$OMV800_HOST = "root@omv800"
$REMOTE_PATH = "/opt/boardgametracker"
$BACKUP_PATH = "/opt/boardgametracker/backups/$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  OMV800 Host: $OMV800_HOST"
Write-Host "  Remote Path: $REMOTE_PATH"
Write-Host "  Backup Path: $BACKUP_PATH"
Write-Host ""

# Check if we can connect to OMV800
Write-Host "🔍 Testing connection to OMV800..."
try {
    $connectionTest = ssh -o ConnectTimeout=10 -o BatchMode=yes $OMV800_HOST "echo 'Connection successful'" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Connection to OMV800 successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot connect to OMV800. Please check your SSH connection." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Cannot connect to OMV800. Please check your SSH connection." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Preparing update package..." -ForegroundColor Yellow

# Create local temporary directory
$TEMP_DIR = "C:\Temp\boardgametracker_update_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

# Copy updated files to temp directory
Write-Host "  Copying updated files..."
Copy-Item "docker-compose.portainer.yml" $TEMP_DIR
Copy-Item "deploy-to-omv800.sh" $TEMP_DIR
Copy-Item "OMV800_DEPLOYMENT_GUIDE.md" $TEMP_DIR

# Create a summary of changes
$CHANGELOG = @"
# BoardGameTracker OMV800 Update Changelog

## New Features Added:
* ScoreSheet Templates functionality
* Score Sessions management
* Enhanced Docker configuration with health checks
* Updated to .NET 9.0 and PostgreSQL 17

## Files Updated:
* docker-compose.portainer.yml (enhanced with health checks and networking)
* deploy-to-omv800.sh (updated deployment script)
* OMV800_DEPLOYMENT_GUIDE.md (comprehensive deployment guide)

## New Files Added:
* ScoreSheet Templates API endpoints
* Score Session management services
* Client-side ScoreSheet components
* Database migrations for new ScoreSheet features

## Docker Configuration Improvements:
* Added health checks for both application and database
* Implemented proper service dependencies
* Enhanced networking configuration
* Updated environment variables
"@

Set-Content -Path "$TEMP_DIR/CHANGELOG.md" -Value $CHANGELOG

Write-Host "✅ Update package prepared in $TEMP_DIR" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Starting OMV800 update process..." -ForegroundColor Yellow

# 1. Create backup on OMV800
Write-Host "  1. Creating backup on OMV800..."
ssh $OMV800_HOST "mkdir -p $BACKUP_PATH"
ssh $OMV800_HOST "cd $REMOTE_PATH && find . -maxdepth 1 -type f -exec cp {} $BACKUP_PATH/ \; 2>/dev/null || true"

# 2. Stop current containers
Write-Host "  2. Stopping current containers..."
ssh $OMV800_HOST "cd $REMOTE_PATH && docker compose -f docker-compose.portainer.yml down"

# 3. Upload new files
Write-Host "  3. Uploading updated files..."
Get-ChildItem $TEMP_DIR | ForEach-Object {
    scp $_.FullName $OMV800_HOST":"$REMOTE_PATH"/"
}

# 4. Update file permissions
Write-Host "  4. Setting file permissions..."
ssh $OMV800_HOST "chmod +x $REMOTE_PATH/*.sh"

# 5. Start updated containers
Write-Host "  5. Starting updated containers..."
ssh $OMV800_HOST "cd $REMOTE_PATH && docker compose -f docker-compose.portainer.yml up -d"

# 6. Monitor startup
Write-Host "  6. Monitoring container startup..."
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📊 Container Status:" -ForegroundColor Yellow
ssh $OMV800_HOST "docker compose -f $REMOTE_PATH/docker-compose.portainer.yml ps"

Write-Host ""
Write-Host "🔍 Checking container logs..." -ForegroundColor Yellow
ssh $OMV800_HOST "docker compose -f $REMOTE_PATH/docker-compose.portainer.yml logs --tail=20"

Write-Host ""
Write-Host "🏥 Testing health checks..." -ForegroundColor Yellow
Write-Host "  Testing application health..."
ssh $OMV800_HOST "curl -f http://localhost:5444/health || echo '❌ Application health check failed'"

Write-Host "  Testing database health..."
ssh $OMV800_HOST "docker compose -f $REMOTE_PATH/docker-compose.portainer.yml exec db pg_isready -U dev -d boardgametracker || echo '❌ Database health check failed'"

Write-Host ""
Write-Host "🎉 OMV800 Portainer Update Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Backup created at: $BACKUP_PATH"
Write-Host "  ✅ Updated files deployed"
Write-Host "  ✅ Containers restarted"
Write-Host "  ✅ Health checks completed"
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check the application at: http://omv800:5444"
Write-Host "  2. Verify all services are running in Portainer"
Write-Host "  3. Test the new ScoreSheet functionality"
Write-Host "  4. Monitor logs for any issues"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - Deployment Guide: $REMOTE_PATH/OMV800_DEPLOYMENT_GUIDE.md"
Write-Host "  - Changelog: $REMOTE_PATH/CHANGELOG.md"
Write-Host ""
Write-Host "⚠️  If issues occur, you can restore from backup:" -ForegroundColor Red
Write-Host "  ssh $OMV800_HOST"
Write-Host "  cd $REMOTE_PATH"
Write-Host "  docker compose -f docker-compose.portainer.yml down"
Write-Host "  cp -r $BACKUP_PATH/* ."
Write-Host "  docker compose -f docker-compose.portainer.yml up -d"

# Cleanup
Remove-Item -Recurse -Force $TEMP_DIR
Write-Host ""
Write-Host "🧹 Cleanup completed" -ForegroundColor Green
Write-Host "✅ Update process finished successfully!" -ForegroundColor Green