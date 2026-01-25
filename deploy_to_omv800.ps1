# PowerShell script to deploy BoardGameTracker to DEPLOY_HOST
# Run this script from your local machine to deploy to your deploy host

Write-Host "=== BoardGameTracker Deployment ===" -ForegroundColor Green
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Pull latest changes from GitHub" -ForegroundColor Yellow
Write-Host "2. Build new Docker image with latest tag" -ForegroundColor Yellow
Write-Host "3. Deploy to DEPLOY_HOST via SSH" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: This deployment includes a fix for API routing issues" -ForegroundColor Red
Write-Host "where API endpoints were incorrectly returning the frontend app." -ForegroundColor Red
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "BoardGameTracker.sln")) {
    Write-Host "Error: This script must be run from the BoardGameTracker repository root" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Red
    exit 1
}

# Check if Docker is available locally
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Warning: Docker is not installed or not available locally" -ForegroundColor Yellow
    Write-Host "Will attempt to build Docker image directly on DEPLOY_HOST" -ForegroundColor Yellow
}

Write-Host "Step 1: Pulling latest changes..." -ForegroundColor Cyan
git pull
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to pull latest changes" -ForegroundColor Red
    exit 1
}

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "Step 2: Building Docker image locally..." -ForegroundColor Cyan
    docker build -t uping/boardgametracker:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to build Docker image locally" -ForegroundColor Red
        Write-Host "Will attempt to build on DEPLOY_HOST instead" -ForegroundColor Yellow
    } else {
        Write-Host "Docker image built successfully locally" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 3: Deploying to DEPLOY_HOST..." -ForegroundColor Cyan
Write-Host "This will SSH into DEPLOY_HOST and run the deployment commands" -ForegroundColor Yellow

# SSH into DEPLOY_HOST and run the deployment commands
$sshCommands = @"
echo "=== DEPLOY_HOST Deployment ==="
cd /path/to/BoardGameTracker

echo "Pulling latest changes on DEPLOY_HOST..."
git pull

echo "Building Docker image on DEPLOY_HOST..."
docker build -t uping/boardgametracker:latest .

echo "Deploying with docker-compose.portainer.yml..."
docker compose -f docker-compose.portainer.yml up -d

echo "=== Deployment Complete on DEPLOY_HOST ==="
echo "Checking container status..."
docker ps
"@

# Execute SSH commands
ssh root@DEPLOY_HOST $sshCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to deploy to DEPLOY_HOST" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "The BoardGameTracker application has been updated on DEPLOY_HOST." -ForegroundColor Green
Write-Host ""
Write-Host "To verify the deployment:" -ForegroundColor Yellow
Write-Host "1. Check container status: ssh root@DEPLOY_HOST 'docker ps'" -ForegroundColor Yellow
Write-Host "2. View logs: ssh root@DEPLOY_HOST 'docker logs boardgametracker-boardgametracker-1'" -ForegroundColor Yellow
Write-Host "3. Test the application at your configured URL" -ForegroundColor Yellow
Write-Host "4. Test API endpoint: curl http://DEPLOY_HOST:5444/api/games" -ForegroundColor Yellow