
#!/bin/bash

# Script to deploy BoardGameTracker to deployment host (DEPLOY_HOST)
# Run this script from your local machine to deploy to your deploy host

echo "=== BoardGameTracker Deployment ==="
echo "This script will:"
echo "1. Pull latest changes from GitHub"
echo "2. Build new Docker image with latest tag"
echo "3. Deploy to DEPLOY_HOST via SSH"
echo ""
echo "IMPORTANT: This deployment includes a fix for API routing issues"
echo "where API endpoints were incorrectly returning the frontend app."
echo ""

# Check if we're in the right directory
if [ ! -f "BoardGameTracker.sln" ]; then
    echo "Error: This script must be run from the BoardGameTracker repository root"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Check if Docker is available locally
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not available"
    exit 1
fi

echo "Step 1: Pulling latest changes..."
git pull
if [ $? -ne 0 ]; then
    echo "Error: Failed to pull latest changes"
    exit 1
fi

echo ""
echo "Step 2: Building Docker image..."
docker build -t uping/boardgametracker:latest .
if [ $? -ne 0 ]; then
    echo "Error: Failed to build Docker image"
    exit 1
fi

echo ""
echo "Step 3: Deploying to DEPLOY_HOST..."
echo "This will SSH into DEPLOY_HOST and run the deployment commands"

# SSH into DEPLOY_HOST and run the deployment commands
ssh root@DEPLOY_HOST << 'EOF'
    echo "=== DEPLOY_HOST Deployment ==="
    cd /opt/boardgametracker
    
    echo "Pulling latest changes on DEPLOY_HOST..."
    git pull
    
    echo "Building Docker image on DEPLOY_HOST..."
    docker build -t uping/boardgametracker:latest .
    
    echo "Deploying with docker-compose.portainer.yml..."
    docker compose -f docker-compose.portainer.yml up -d
    
    echo "Waiting for database to be ready..."
    sleep 10
    
    echo "Applying database migrations..."
    docker exec boardgametracker-boardgametracker-1 /app/BoardGameTracker.Host --migrate
    
    echo "=== Deployment Complete on DEPLOY_HOST ==="
    echo "Checking container status..."
    docker ps
EOF

if [ $? -ne 0 ]; then
    echo "Error: Failed to deploy to DEPLOY_HOST"
    exit 1
fi

echo ""
echo "=== Deployment Complete! ==="
echo "The BoardGameTracker application has been updated on DEPLOY_HOST."
echo ""
echo "To verify the deployment:"
echo "1. Check container status: ssh root@DEPLOY_HOST 'docker ps'"
echo "2. View logs: ssh root@DEPLOY_HOST 'docker logs boardgametracker-boardgametracker-1'"
echo "3. Test the application at your configured URL"
echo "4. Test API endpoint: curl http://DEPLOY_HOST:5444/api/games"