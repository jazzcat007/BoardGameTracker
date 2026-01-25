# BoardGameTracker Deployment Script for OMV800
# Run these commands on your omv800 server

# 1. SSH into your server
ssh root@omv800

# 2. Navigate to the deployment directory
cd /opt/boardgametracker

# 3. Backup current setup (optional but recommended)
cp docker-compose.portainer.yml docker-compose.portainer.yml.backup

# 4. Pull latest images
docker pull uping/boardgametracker:latest
docker pull postgres:17

# 5. Stop current containers
docker-compose -f docker-compose.portainer.yml down

# 6. Start updated containers
docker-compose -f docker-compose.portainer.yml up -d

# 7. Check logs to ensure everything started correctly
docker-compose -f docker-compose.portainer.yml logs -f

# 8. Verify the application is running
curl http://localhost:5444/health || curl http://localhost:5444/

# Alternative: If you need to rebuild the image locally first
# On your development machine:
# docker build -t uping/boardgametracker:latest .
# docker push uping/boardgametracker:latest
# Then run steps 1-7 above