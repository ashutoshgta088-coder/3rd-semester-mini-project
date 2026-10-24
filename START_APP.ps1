# stuatten - Smart Biometric Attendance System Launcher
# Double-click this file or right-click -> Run with PowerShell

$Host.UI.RawUI.WindowTitle = "stuatten Server"

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host "   stuatten - Smart Biometric Attendance System (AKTU)" -ForegroundColor Cyan
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the server folder
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $scriptDir "server"

if (-not (Test-Path $serverDir)) {
    Write-Host " ERROR: server folder not found at $serverDir" -ForegroundColor Red
    Read-Host " Press Enter to exit"
    exit 1
}

Set-Location $serverDir

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host " [SETUP] First run - Installing dependencies..." -ForegroundColor Yellow
    Write-Host "         Please wait 1-2 minutes (only happens once)..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Kill any existing process on port 5000
$portProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portProcess) {
    Write-Host " [INFO] Stopping old server on port 5000..." -ForegroundColor Yellow
    $portProcess | ForEach-Object { 
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
    }
    Start-Sleep -Seconds 1
}

# Launch browser after a delay (background job)
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:5000"
} | Out-Null

Write-Host " [SERVER] Starting at http://localhost:5000 ..." -ForegroundColor Green
Write-Host ""
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host "  Browser will open automatically in 4 seconds." -ForegroundColor White
Write-Host ""
Write-Host "  URL   :  http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Login Credentials:" -ForegroundColor White
Write-Host "   Student  ->  2100270100001  /  studentpassword" -ForegroundColor Green
Write-Host "   Teacher  ->  T1001          /  teacherpassword" -ForegroundColor Green
Write-Host "   Admin    ->  admin          /  adminpassword123" -ForegroundColor Green
Write-Host ""
Write-Host "  Keep this window open. Press Ctrl+C to stop." -ForegroundColor Red
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server (blocking - keeps window open)
node src/server.js
