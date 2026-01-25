#!/usr/bin/env bash
set -euo pipefail

cd /src

echo "Restoring dependencies for migration run..."
dotnet restore "BoardGameTracker.Host/BoardGameTracker.Host.csproj"

echo "Applying database migrations..."
dotnet ef database update \
  --project "BoardGameTracker.Core/BoardGameTracker.Core.csproj" \
  --startup-project "BoardGameTracker.Host/BoardGameTracker.Host.csproj" \
  --context MainDbContext \
  -c Release

cd /app

echo "Starting BoardGameTracker host..."
exec dotnet BoardGameTracker.Host.dll
