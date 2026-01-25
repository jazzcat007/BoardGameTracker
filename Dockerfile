# docker run -e DB_HOST=192.168.72.66 -e DB_USER=dev -e DB_PASSWORD=dev -e DB_NAME=boardgametracker-dev -p 6544:5444 -v C:\Users\mikha\Documents\Repositories\BoardGameTracker\BoardGameTracker.Host\data:/app/data -v C:\Users\mikha\Documents\Repositories\BoardGameTracker\BoardGameTracker.Host\images:/app/images
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS with-node
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_24.x | bash
RUN apt-get -y install nodejs

FROM with-node AS publish
WORKDIR /src
COPY . .
RUN dotnet restore "./BoardGameTracker.Host/BoardGameTracker.Host.csproj"
RUN dotnet publish "./BoardGameTracker.Host/BoardGameTracker.Host.csproj" -c Release -o /publish

FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /app
COPY --from=publish /publish .
COPY --from=publish /src /src
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV ASPNETCORE_ENVIRONMENT=production
ENV DOTNET_EnableDiagnostics=0
ENV ASPNETCORE_URLS=http://*:5444
EXPOSE 5444
ENTRYPOINT ["/entrypoint.sh"]
