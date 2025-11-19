FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FlexCard.API.csproj", "."]
RUN dotnet restore "FlexCard.API.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "FlexCard.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FlexCard.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FlexCard.API.dll"]