# OBELISK - Script de demarrage rapide (Windows)
# Usage: .\start-obelisk.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   OBELISK - Demarrage en mode DEMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: Node.js non installe!" -ForegroundColor Red
    exit 1
}

$obeliskDir = "C:\Users\Hugop\obelisk"
$backendDir = "$obeliskDir\obelisk-backend"
$frontendDir = "$obeliskDir\obelisk-dex"

# Verifier que les dossiers existent
if (-not (Test-Path $backendDir)) {
    Write-Host "ERREUR: Backend non trouve: $backendDir" -ForegroundColor Red
    exit 1
}

# Afficher le mode
Write-Host "[MODE] DEMO - Les fonds sont simules" -ForegroundColor Yellow
Write-Host ""

# Demarrer le backend avec PM2
Write-Host "[1/3] Demarrage du serveur backend..." -ForegroundColor Green
Set-Location $backendDir

# Verifier si PM2 est disponible
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 delete obelisk 2>$null
    pm2 start server-ultra.js --name obelisk
    Write-Host "      Backend demarre avec PM2" -ForegroundColor DarkGreen
} else {
    Write-Host "      PM2 non disponible, demarrage direct..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "server-ultra.js" -WorkingDirectory $backendDir -WindowStyle Minimized
}

Start-Sleep -Seconds 2

# Verifier que le backend repond
Write-Host "[2/3] Verification du backend..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 5
    Write-Host "      Backend OK: $($response.status)" -ForegroundColor DarkGreen
} catch {
    Write-Host "      ATTENTION: Backend ne repond pas encore" -ForegroundColor Yellow
}

# Afficher les URLs
Write-Host ""
Write-Host "[3/3] OBELISK est pret!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   URLs disponibles:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Local:      http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend:   https://obelisk-dex.pages.dev" -ForegroundColor White
Write-Host "   API Health: http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "   Logs: pm2 logs obelisk" -ForegroundColor DarkGray
Write-Host "   Stop: pm2 stop obelisk" -ForegroundColor DarkGray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Retourner au dossier original
Set-Location $obeliskDir
