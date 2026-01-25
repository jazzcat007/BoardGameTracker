# BoardGameTracker OMV800 Deployment Guide
# Updated for .NET 9.0, Node.js 24.x, PostgreSQL 17

## Prerequisites
- SSH access to root@omv800
- Docker and Docker Compose installed on OMV800
- Updated docker-compose.portainer.yml file copied to server

## Step 1: Connect to OMV800
```bash
ssh root@omv800
```

## Step 2: Navigate to Deployment Directory
```bash
cd /opt/boardgametracker
```

## Step 3: Backup Current Configuration
```bash
cp docker-compose.portainer.yml docker-compose.portainer.yml.backup.$(date +%Y%m%d_%H%M%S)
```

## Step 4: Copy Updated Files
From your development machine, copy the updated files:
```bash
# On your development machine
scp docker-compose.portainer.yml root@omv800:/opt/boardgametracker/
scp deploy-to-omv800.sh root@omv800:/opt/boardgametracker/
```

## Step 5: Update Environment Variables
Edit the docker-compose.portainer.yml file and update the database password:
```bash
nano docker-compose.portainer.yml
# Change CHANGEME to a secure password in both DB_PASSWORD variables
```

## Step 6: Pull Latest Images
```bash
docker pull uping/boardgametracker:latest
docker pull postgres:17
```

## Step 7: Stop Current Containers
```bash
docker-compose -f docker-compose.portainer.yml down
```

## Step 8: Clean Up (Optional)
```bash
# Remove unused images
docker image prune -f
# Remove unused volumes (be careful!)
# docker volume prune -f
```

## Step 9: Start Updated Containers
```bash
docker-compose -f docker-compose.portainer.yml up -d
```

## Step 10: Monitor Startup
```bash
# Check container status
docker-compose -f docker-compose.portainer.yml ps

# View logs
docker-compose -f docker-compose.portainer.yml logs -f

# Check health
docker-compose -f docker-compose.portainer.yml exec boardgametracker curl -f http://localhost:5444/health
```

## Step 11: Verify Deployment
```bash
# Test application endpoint
curl http://localhost:5444/

# Check database connection
docker-compose -f docker-compose.portainer.yml exec db pg_isready -U dev -d boardgametracker
```

## Troubleshooting

### If containers fail to start:
```bash
# Check detailed logs
docker-compose -f docker-compose.portainer.yml logs

# Check container status
docker ps -a

# Inspect failed containers
docker inspect <container_name>
```

### If database migration is needed:
```bash
# Run EF Core migrations (if applicable)
docker-compose -f docker-compose.portainer.yml exec boardgametracker dotnet ef database update
```

### Rollback if needed:
```bash
# Stop current deployment
docker-compose -f docker-compose.portainer.yml down

# Restore backup
cp docker-compose.portainer.yml.backup.* docker-compose.portainer.yml

# Start with old configuration
docker-compose -f docker-compose.portainer.yml up -d
```

## Post-Deployment
- Update your Portainer stacks if using Portainer UI
- Monitor logs for any issues
- Test all application features
- Update any reverse proxy configurations if applicable

## Security Notes
- Change default database password
- Consider using Docker secrets for sensitive data
- Regularly update base images
- Monitor container resource usage