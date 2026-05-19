# ============================================================
# LE RURAL - Script de Build et Packaging pour Deploiement
# Compatible: Windows PowerShell 5.1+ / PowerShell Core 7+
# ============================================================

param(
    [switch]$SkipBuild,
    [switch]$SkipComposer,
    [string]$OutputName = "lerural-deploy"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Couleurs pour l'affichage
function Write-Step { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[X] $msg" -ForegroundColor Red }

# Banner
Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║         LE RURAL - Build & Deploy Package             ║" -ForegroundColor Green
Write-Host "  ║     1er groupe de presse agricole en Afrique          ║" -ForegroundColor Green
Write-Host "  ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Verifier qu'on est dans le bon dossier
if (-not (Test-Path "artisan")) {
    Write-Error "Ce script doit etre execute depuis la racine du projet Laravel!"
    exit 1
}

$projectRoot = Get-Location
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipName = "${OutputName}-${timestamp}.zip"
$zipPath = Join-Path $projectRoot $zipName

# Etape 1: Build Frontend
if (-not $SkipBuild) {
    Write-Step "Build du frontend (npm run build)..."
    
    if (-not (Test-Path "node_modules")) {
        Write-Warning "node_modules absent, installation des dependances..."
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install a echoue" }
    }
    
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build a echoue" }
    Write-Success "Build frontend termine"
} else {
    Write-Warning "Build frontend ignore (--SkipBuild)"
}

# Verifier que le build existe
if (-not (Test-Path "public/build")) {
    Write-Error "Le dossier public/build n'existe pas! Executez 'npm run build' d'abord."
    exit 1
}

# Etape 2: Optimiser Composer
if (-not $SkipComposer) {
    Write-Step "Optimisation Composer (production)..."
    composer install --no-dev --optimize-autoloader --no-interaction
    if ($LASTEXITCODE -ne 0) { throw "composer install a echoue" }
    Write-Success "Composer optimise"
} else {
    Write-Warning "Composer ignore (--SkipComposer)"
}

# Etape 3: Nettoyer les fichiers temporaires
Write-Step "Nettoyage des fichiers temporaires..."

$cleanupPaths = @(
    "storage/logs/*.log",
    "storage/framework/cache/data/*",
    "storage/framework/sessions/*",
    "storage/framework/views/*",
    "storage/debugbar/*",
    "bootstrap/cache/*.php"
)

foreach ($pattern in $cleanupPaths) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    if ($files) {
        $files | Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

# Creer les fichiers .gitkeep necessaires
$gitkeepDirs = @(
    "storage/logs",
    "storage/framework/cache",
    "storage/framework/sessions",
    "storage/framework/views",
    "storage/app/public",
    "bootstrap/cache"
)

foreach ($dir in $gitkeepDirs) {
    $gitkeepPath = Join-Path $dir ".gitkeep"
    if (-not (Test-Path $gitkeepPath)) {
        New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
    }
}

Write-Success "Nettoyage termine"

# Etape 4: Creer le ZIP
Write-Step "Creation du ZIP de deploiement..."

# Liste des exclusions
$excludePatterns = @(
    "node_modules",
    ".git",
    ".github",
    "tests",
    ".env",
    ".env.local",
    ".env.example",
    ".env.testing",
    "*.log",
    "*.zip",
    ".DS_Store",
    "Thumbs.db",
    ".idea",
    ".vscode",
    "phpunit.xml",
    ".editorconfig",
    ".styleci.yml",
    ".prettierrc",
    ".eslintrc.json",
    "refonte-lerural.txt",
    "refonte-lerural-build.zip"
)

# Creer une liste de fichiers a inclure
$allItems = Get-ChildItem -Path $projectRoot -Force | Where-Object {
    $item = $_
    $exclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($item.Name -like $pattern -or $item.Name -eq $pattern) {
            $exclude = $true
            break
        }
    }
    
    -not $exclude
}

# Supprimer l'ancien ZIP s'il existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Creer un dossier temporaire pour le packaging
$tempDir = Join-Path $env:TEMP "lerural-deploy-$timestamp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "  Copie des fichiers..." -ForegroundColor Gray

# Copier les fichiers
foreach ($item in $allItems) {
    $destPath = Join-Path $tempDir $item.Name
    
    if ($item.PSIsContainer) {
        # C'est un dossier
        Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force
    } else {
        # C'est un fichier
        Copy-Item -Path $item.FullName -Destination $destPath -Force
    }
}

# Nettoyer le dossier temporaire des fichiers inutiles
$deepCleanPatterns = @(
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    ".git",
    ".gitignore",
    ".gitattributes"
)

Get-ChildItem -Path $tempDir -Recurse -Force -Include $deepCleanPatterns | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

# Supprimer node_modules s'il a ete copie par erreur
$nodeModulesPath = Join-Path $tempDir "node_modules"
if (Test-Path $nodeModulesPath) {
    Remove-Item $nodeModulesPath -Recurse -Force
}

Write-Host "  Compression..." -ForegroundColor Gray

# Creer le ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

# Nettoyer le dossier temporaire
Remove-Item $tempDir -Recurse -Force

Write-Success "ZIP cree: $zipName"

# Etape 5: Statistiques
Write-Step "Statistiques du package"

$zipInfo = Get-Item $zipPath
$sizeMB = [math]::Round($zipInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "  Fichier: $zipName" -ForegroundColor White
Write-Host "  Taille:  $sizeMB MB" -ForegroundColor White
Write-Host "  Chemin:  $zipPath" -ForegroundColor Gray
Write-Host ""

# Resume
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    BUILD TERMINE !                        ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║  Prochaines etapes:                                       ║" -ForegroundColor Green
Write-Host "║  1. Uploader $zipName sur Hostinger        " -ForegroundColor Yellow
Write-Host "║  2. Extraire dans public_html                             " -ForegroundColor Yellow
Write-Host "║  3. Configurer le fichier .env                            " -ForegroundColor Yellow
Write-Host "║  4. Executer: php artisan migrate --force                  " -ForegroundColor Yellow
Write-Host "║  5. Executer: php artisan cache:warmup                     " -ForegroundColor Yellow
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║  Voir docs/DEPLOIEMENT_HOSTINGER.md pour le guide complet ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Restaurer les dependances de dev si necessaire
Write-Host "Note: Pour restaurer les dependances de dev, executez:" -ForegroundColor Gray
Write-Host "      composer install" -ForegroundColor Gray
Write-Host ""