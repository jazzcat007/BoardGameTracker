ust # BoardGameTracker Deployment Instructions

## Deploying to DEPLOY_HOST Portainer

Since the BoardGameTracker application runs on your DEPLOY_HOST server via Portainer, follow these steps to deploy the latest changes:

### Prerequisites
- Access to your deployment host (SSH or direct terminal access)
- Docker and Docker Compose installed on your deployment host
- Git access to the BoardGameTracker repository

### Deployment Steps

1. **SSH into your DEPLOY_HOST server**
   ```bash
   ssh root@DEPLOY_HOST
   ```

2. **Navigate to your BoardGameTracker repository**
   ```bash
   cd /path/to/BoardGameTracker
   ```

3. **Make the deployment script executable**
   ```bash
   chmod +x deploy_to_server.sh
   ```

4. **Run the deployment script**
   ```bash
   ./deploy_to_server.sh
   ```

### What the Script Does

The `deploy_to_server.sh` script will:
1. Pull the latest changes from the GitHub repository
2. Build a new Docker image tagged as `uping/boardgametracker:latest`
3. Deploy the updated containers using `docker-compose.portainer.yml`

### Manual Deployment (Alternative)

If you prefer to run the commands manually:

```bash
# Pull latest changes
git pull

# Build the Docker image
docker build -t uping/boardgametracker:latest .

# Deploy using the Portainer compose file
docker compose -f docker-compose.portainer.yml up -d
```

### Verification

After deployment, verify the update was successful:

1. **Check container status:**
   ```bash
   docker ps
   ```

2. **View application logs:**
   ```bash
   docker logs boardgametracker-boardgametracker-1
   ```

3. **Test the application:**
   - Visit your configured BoardGameTracker URL
   - Check that the `/score-sheets/` endpoint loads correctly
   - Verify any new features or fixes are working as expected

### Troubleshooting

- **Permission issues:** Ensure you have proper permissions to run Docker commands
- **Build failures:** Check the Docker build output for any errors
- **Container issues:** Use `docker logs` to check for application errors
- **Network issues:** Verify your DEPLOY_HOST server can access the internet for pulling updates

### Rollback (if needed)

If you need to rollback to a previous version:
```bash
# Stop current containers
docker compose -f docker-compose.portainer.yml down

# Pull previous commit (replace with actual commit hash)
git checkout <previous-commit-hash>

# Rebuild and redeploy
docker build -t uping/boardgametracker:latest .
docker compose -f docker-compose.portainer.yml up -d