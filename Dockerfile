FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/FlexCard.API.csproj ./backend/
RUN dotnet restore ./backend/FlexCard.API.csproj
COPY backend/ ./backend/
WORKDIR /src/backend
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "FlexCard.API.dll"]