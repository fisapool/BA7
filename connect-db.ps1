# Get the MySQL container ID
$containerId = docker ps --filter "ancestor=mysql:8.0" --format "{{.ID}}"

if ([string]::IsNullOrEmpty($containerId)) {
    Write-Host "MySQL container not found or not running! Starting services..." -ForegroundColor Red
    docker-compose up -d
    Start-Sleep -Seconds 10
    $containerId = docker ps --filter "ancestor=mysql:8.0" --format "{{.ID}}"
    
    if ([string]::IsNullOrEmpty($containerId)) {
        Write-Host "Failed to start MySQL container. Check docker-compose logs." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Connecting to MySQL container..." -ForegroundColor Green
docker exec -it $containerId mysql -u root -prootpassword lazada_products 