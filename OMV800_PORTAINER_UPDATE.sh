#!/bin/bash

# BoardGameTracker OMV800 Portainer Update Script
# This script updates your OMV800 server with the latest changes

echo "🚀 BoardGameTracker OMV800 Portainer Update Script"
echo "=================================================="

# Configuration
OMV800_HOST="root@omv800"
REMOTE_PATH="/opt/boardgametracker"
BACKUP_PATH="/opt/boardgametracker/backups/$(date +%Y%m%d_%H%M%S)"

echo "📋 Configuration:"
echo "  OMV800 Host: $OMV800_HOST"
echo "  Remote Path: $REMOTE_PATH"
echo "  Backup Path: $BACKUP_PATH"
echo ""

# Check if we can connect to OMV800
echo "🔍 Testing connection to OMV800..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes $OMV800_HOST "echo 'Connection successful'" 2>/dev/null; then
    echo "✅ Connection to OMV800 successful"
else
    echo "❌ Cannot connect to OMV800. Please check your SSH connection."
    exit 1
fi

echo ""
echo "📦 Preparing update package..."

# Create local temporary directory
TEMP_DIR="/tmp/boardgametracker_update_$(date +%s)"
mkdir -p "$TEMP_DIR"

# Copy updated files to temp directory
echo "  Copying updated files..."
cp docker-compose.portainer.yml "$TEMP_DIR/"
cp deploy-to-omv800.sh "$TEMP_DIR/"
cp OMV800_DEPLOYMENT_GUIDE.md "$TEMP_DIR/"

# Create a summary of changes
cat > "$TEMP_DIR/CHANGELOG.md" << 'EOF'
# BoardGameTracker OMV800 Update Changelog

## New Features Added:
- ScoreSheet Templates functionality
- Score Sessions management
- Enhanced Docker configuration with health checks
- Updated to .NET 9.0 and PostgreSQL 17

## Files Updated:
- docker-compose.portainer.yml (enhanced with health checks and networking)
- deploy-to-omv800.sh (updated deployment script)
- OMV800_DEPLOYMENT_GUIDE.md (comprehensive deployment guide)

## New Files Added:
- ScoreSheet Templates API endpoints
- Score Session management services
- Client-side ScoreSheet components
- Database migrations for new ScoreSheet features

## Docker Configuration Improvements:
- Added health checks for both application and database
- Implemented proper service dependencies
- Enhanced networking configuration
- Updated environment variables
EOF

echo "✅ Update package prepared in $TEMP_DIR"

echo ""
echo "🔄 Starting OMV800 update process..."

# 1. Create backup on OMV800
echo "  1. Creating backup on OMV800..."
ssh $OMV800_HOST "mkdir -p $BACKUP_PATH"
ssh $OMV800_HOST "cp -r $REMOTE_PATH/* $BACKUP_PATH/ 2>/dev/null || true"

# 2. Stop current containers
echo "  2. Stopping current containers..."
ssh $OMV800_HOST "cd $REMOTE_PATH && docker-compose -f docker-compose.portainer.yml down"

# 3. Upload new files
echo "  3. Uploading updated files..."
scp "$TEMP_DIR"/*.* $OMV800_HOST:$REMOTE_PATH/

# 4. Update file permissions
echo "  4. Setting file permissions..."
ssh $OMV800_HOST "chmod +x $REMOTE_PATH/*.sh"

# 5. Start updated containers
echo "  5. Starting updated containers..."
ssh $OMV800_HOST "cd $REMOTE_PATH && docker-compose -f docker-compose.portainer.yml up -d"

# 6. Monitor startup
echo "  6. Monitoring container startup..."
sleep 10

echo ""
echo "📊 Container Status:"
ssh $OMV800_HOST "docker-compose -f $REMOTE_PATH/docker-compose.portainer.yml ps"

echo ""
echo "🔍 Checking container logs..."
ssh $OMV800_HOST "docker-compose -f $REMOTE_PATH/docker-compose.portainer.yml logs --tail=20"

echo ""
echo "🏥 Testing health checks..."
echo "  Testing application health..."
ssh $OMV800_HOST "curl -f http://localhost:5444/health || echo '❌ Application health check failed'"

echo "  Testing database health..."
ssh $OMV800_HOST "docker-compose -f $REMOTE_PATH/docker-compose.portainer.yml exec db pg_isready -U dev -d boardgametracker || echo '❌ Database health check failed'"

echo ""
echo "🎉 OMV800 Portainer Update Complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Backup created at: $BACKUP_PATH"
echo "  ✅ Updated files deployed"
echo "  ✅ Containers restarted"
echo "  ✅ Health checks completed"
echo ""
echo "🔧 Next Steps:"
echo "  1. Check the application at: http://omv800:5444"
echo "  2. Verify all services are running in Portainer"
echo "  3. Test the new ScoreSheet functionality"
echo "  4. Monitor logs for any issues"
echo ""
echo "📚 Documentation:"
echo "  - Deployment Guide: $REMOTE_PATH/OMV800_DEPLOYMENT_GUIDE.md"
echo "  - Changelog: $REMOTE_PATH/CHANGELOG.md"
echo ""
echo "⚠️  If issues occur, you can restore from backup:"
echo "  ssh $OMV800_HOST"
echo "  cd $REMOTE_PATH"
echo "  docker-compose -f docker-compose.portainer.yml down"
echo "  cp -r $BACKUP_PATH/* ."
echo "  docker-compose -f docker-compose.portainer.yml up -d"

# Cleanup
rm -rf "$TEMP_DIR"
echo ""
echo "🧹 Cleanup completed"
echo "✅ Update process finished successfully!"