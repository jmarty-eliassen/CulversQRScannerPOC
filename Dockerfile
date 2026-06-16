# Build stage: compile and publish the Blazor WebAssembly app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["CulversQRCodeScanner.csproj", "./"]
RUN dotnet restore "CulversQRCodeScanner.csproj"

COPY . .
RUN dotnet publish "CulversQRCodeScanner.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage: serve the published files with nginx
FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/publish /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
