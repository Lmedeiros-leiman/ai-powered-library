# build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY Server/*.csproj ./Server/
RUN dotnet restore ./Server/Server.csproj
COPY Protos/ ./Protos/
COPY Server/ ./Server/
RUN dotnet publish ./Server/Server.csproj -c Release -o /out

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out ./
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "Server.dll"]
