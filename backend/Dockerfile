# Dockerfile optimizado para producción
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Configurar usuario no-root para seguridad
RUN adduser --disabled-password --gecos '' appuser
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY ["FlexoAuthBackend.csproj", "."]
RUN dotnet restore "FlexoAuthBackend.csproj"

# Copiar código fuente y compilar
COPY . .
WORKDIR "/src"
RUN dotnet build "FlexoAuthBackend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FlexoAuthBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Configurar variables de entorno para producción
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Configurar límites de recursos
ENV DOTNET_gcServer=1
ENV DOTNET_gcConcurrent=1
ENV DOTNET_GCHeapCount=4
ENV DOTNET_ThreadPool_ForceMinWorkerThreads=32
ENV DOTNET_ThreadPool_ForceMaxWorkerThreads=800

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "FlexoAuthBackend.dll"]