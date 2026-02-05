# Set Railway Environment Variables
# Thông tin từ Railway dashboard

$env:RAILWAY_HOST="switchyard.proxy.rlwy.net"
$env:RAILWAY_PORT="20542"
$env:RAILWAY_DATABASE="railway"
$env:RAILWAY_USER="root"
$env:RAILWAY_PASSWORD="arAFXMvHwfVOUlzXiBCTctqFIUtGZHlg"

Write-Host "✓ Railway environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "Current values:" -ForegroundColor Cyan
Write-Host "  RAILWAY_HOST=$env:RAILWAY_HOST"
Write-Host "  RAILWAY_PORT=$env:RAILWAY_PORT"
Write-Host "  RAILWAY_DATABASE=$env:RAILWAY_DATABASE"
Write-Host "  RAILWAY_USER=$env:RAILWAY_USER"
Write-Host "  RAILWAY_PASSWORD=***hidden***"
Write-Host ""
Write-Host "Now run: .\mvnw.cmd spring-boot:run" -ForegroundColor Yellow
