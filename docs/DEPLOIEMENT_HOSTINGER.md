
# Guide de Déploiement - LE RURAL sur Hostinger

> **Dernière mise à jour:** Janvier 2025  
> **Prérequis:** Hostinger Premium/Business avec PHP 8.2+, MySQL, SSH

---

## 📋 Checklist Pré-déploiement

### Sur votre machine locale
- [ ] Tous les tests passent (`php artisan test`)
- [ ] Build frontend terminé (`npm run build`)
- [ ] Fichier `.env.production` prêt
- [ ] ZIP généré avec le script fourni

### Sur Hostinger
- [ ] Base de données MySQL créée
- [ ] Utilisateur DB avec tous les privilèges
- [ ] Domaine configuré et SSL activé
- [ ] Accès SSH activé (Hostinger Premium+)

---

## 🔧 Configuration Hostinger

### 1. Créer la base de données

1. Aller dans **hPanel → Databases → MySQL Databases**
2. Créer une nouvelle base de données :
   - Nom: `lerural_prod` (ou selon votre préférence)
   - Créer un utilisateur avec mot de passe fort
   - Donner tous les privilèges à l'utilisateur sur cette DB

### 2. Configurer PHP

1. Aller dans **hPanel → Advanced → PHP Configuration**
2. Sélectionner **PHP 8.2** ou supérieur
3. Configurer les paramètres :
   ```
   memory_limit = 512M
   max_execution_time = 300
   post_max_size = 64M
   upload_max_filesize = 64M
   max_input_vars = 5000
   ```

### 3. Activer SSH (si pas déjà fait)

1. Aller dans **hPanel → Advanced → SSH Access**
2. Activer l'accès SSH
3. Noter le port SSH (généralement 65002 sur Hostinger)

---

## 📦 Préparation du ZIP

### Option 1: Script automatique (Recommandé)

Exécutez sur votre machine locale :

```powershell
# Windows PowerShell
.\scripts\build-deploy.ps1
```

Ou :

```bash
# Linux/Mac
./scripts/build-deploy.sh
```

### Option 2: Manuel

```bash
# 1. Build frontend
npm run build

# 2. Optimiser autoload
composer install --no-dev --optimize-autoloader

# 3. Créer le ZIP (voir liste des exclusions ci-dessous)
```

### Fichiers à EXCLURE du ZIP :
```
node_modules/
.git/
.github/
tests/
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
.env
.env.local
.env.example
*.log
*.zip
.DS_Store
Thumbs.db
```

---

## 🚀 Déploiement

### Méthode 1: Via File Manager (Simple)

1. Aller dans **hPanel → Files → File Manager**
2. Naviguer vers `public_html` (ou votre dossier de domaine)
3. Supprimer le contenu existant (sauf `.htaccess` si personnalisé)
4. Uploader le ZIP
5. Extraire le ZIP
6. Déplacer le contenu du dossier extrait vers la racine

### Méthode 2: Via SSH (Recommandé)

```bash
# 1. Connexion SSH
ssh -p 65002 u123456789@votre-domaine.com

# 2. Aller dans le dossier
cd public_html

# 3. Nettoyer (attention, backup d'abord si nécessaire)
rm -rf * .[^.]*

# 4. Upload via SCP depuis votre machine locale
scp -P 65002 lerural-deploy.zip u123456789@votre-domaine.com:~/public_html/

# 5. Extraire
unzip lerural-deploy.zip
rm lerural-deploy.zip

# 6. Configurer les permissions
chmod -R 755 .
chmod -R 775 storage bootstrap/cache
```

---

## ⚙️ Configuration Post-déploiement

### 1. Créer le fichier .env

```bash
# Via SSH ou File Manager, créer .env à la racine
nano .env
```

Contenu minimal du `.env` :

```env
APP_NAME="LE RURAL"
APP_ENV=production
APP_KEY=base64:VOTRE_CLE_GENEREE
APP_DEBUG=false
APP_TIMEZONE=Africa/Porto-Novo
APP_URL=https://lerural.bj

# Base de données Hostinger
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u123456789_lerural
DB_USERNAME=u123456789_lerural
DB_PASSWORD=VotreMotDePasseSecurise

# Sessions & Cache
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database

# Mail (Hostinger SMTP ou service externe)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=contact@lerural.bj
MAIL_PASSWORD=VotreMotDePasseMail
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=contact@lerural.bj
MAIL_FROM_NAME="LE RURAL"

# Cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_UPLOAD_PRESET=lerural_uploads

# Paiements
KKIAPAY_PUBLIC_KEY=pk_xxx
KKIAPAY_PRIVATE_KEY=prk_xxx
KKIAPAY_SECRET=sk_xxx
KKIAPAY_SANDBOX=false

# Sécurité
SANCTUM_STATEFUL_DOMAINS=lerural.bj,www.lerural.bj
SESSION_DOMAIN=.lerural.bj
```

### 2. Générer la clé d'application

```bash
php artisan key:generate
```

### 3. Exécuter les migrations

```bash
php artisan migrate --force
```

### 4. Seeders (Sélectifs - ⚠️ IMPORTANT)

```bash
# ⚠️ NE PAS exécuter db:seed complet si la BDD contient déjà des articles!
# La BDD distante contient des données plus récentes que le code local.

# ✅ Seeders SÛRS à exécuter (ajoutent/mettent à jour sans écraser):
php artisan db:seed --class=SettingSeeder --force          # Settings par défaut
php artisan db:seed --class=RedFlagSeeder --force          # Mots interdits modération
php artisan db:seed --class=CommentSettingsSeeder --force  # Config commentaires

# ⚠️ Seeders DANGEREUX (écrasent les données existantes):
# - ArticleSeeder      → Écrase les articles (NE PAS EXÉCUTER)
# - CategorySeeder     → Écrase les catégories
# - AnnouncementSeeder → Écrase les annonces
# - WebTvVideoSeeder   → Écrase les vidéos
# - LiveStreamSeeder   → Écrase les lives
# - PollSeeder         → Écrase les sondages
# - PartnerSeeder      → Écrase les partenaires

# Pour une installation VIERGE uniquement:
# php artisan db:seed --force
```

### 5. Optimiser pour la production

```bash
# Cache de configuration
php artisan config:cache

# Cache des routes
php artisan route:cache

# Cache des vues
php artisan view:cache

# Préchauffer le cache applicatif
php artisan cache:warmup

# Créer le lien symbolique storage
php artisan storage:link
```

---

## 🔒 Configuration .htaccess

Créer/modifier `.htaccess` à la racine :

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirection HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Redirection www vers non-www (ou inverse selon préférence)
    RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
    RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
    
    # Redirection vers public/
    RewriteCond %{REQUEST_URI} !^/public/
    RewriteRule ^(.*)$ /public/$1 [L]
</IfModule>

# Sécurité
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

# Cache statique
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/json
    AddOutputFilterByType DEFLATE application/javascript text/javascript
    AddOutputFilterByType DEFLATE text/xml application/xml application/rss+xml
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>
```

Et dans `public/.htaccess` (déjà présent normalement) :

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

## 📊 Configuration Cron Jobs

Dans **hPanel → Advanced → Cron Jobs**, ajouter :

```bash
# Scheduler Laravel (toutes les minutes)
* * * * * cd /home/u123456789/public_html && php artisan schedule:run >> /dev/null 2>&1

# Queue worker (si vous utilisez les jobs)
* * * * * cd /home/u123456789/public_html && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

---

## 🔍 Vérifications Post-déploiement

### 1. Tester les pages principales
- [ ] Page d'accueil
- [ ] Page article
- [ ] Page catégorie
- [ ] Connexion/Inscription
- [ ] Dashboard admin

### 2. Tester les fonctionnalités critiques
- [ ] Création d'article (admin)
- [ ] Commentaires
- [ ] Paiements (mode test d'abord)
- [ ] Upload d'images

### 3. Vérifier les logs
```bash
tail -f storage/logs/laravel.log
```

### 4. Tester le SEO
- Utiliser [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Utiliser [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 🆘 Dépannage

### Erreur 500
```bash
# Vérifier les logs
tail -50 storage/logs/laravel.log

# Vérifier les permissions
chmod -R 775 storage bootstrap/cache
```

### Page blanche
```bash
# Vider tous les caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### Erreur de connexion DB
- Vérifier les identifiants dans `.env`
- Sur Hostinger, le host est généralement `localhost`
- Vérifier que l'utilisateur a les bons privilèges

### Assets non chargés
```bash
# Recréer le lien storage
php artisan storage:link

# Vérifier que le build existe
ls -la public/build/
```

### Erreur "Class not found"
```bash
# Régénérer l'autoload
composer dump-autoload --optimize
```

---

## 📈 Optimisations Hostinger

### 1. Activer LiteSpeed Cache (si disponible)
- hPanel → Performance → Cache Manager
- Activer le cache

### 2. Configurer Cloudflare (recommandé)
- Ajouter le domaine à Cloudflare
- Configurer les règles de cache
- Activer la minification

### 3. Monitoring
- Utiliser le monitoring Hostinger intégré
- Configurer des alertes par email

---

## 🔄 Mises à jour futures

Pour les mises à jour ultérieures :

```bash
# 1. Activer le mode maintenance
php artisan down --secret="votre-secret-temporaire"

# 2. Upload et extraction du nouveau ZIP

# 3. Migrations
php artisan migrate --force

# 4. Vider et reconstruire les caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan cache:warmup

# 5. Désactiver le mode maintenance
php artisan up
```

---

## 📞 Support

- **Hostinger Support:** Chat 24/7 dans hPanel
- **Documentation Laravel:** https://laravel.com/docs
- **Développeur:** [KIJANILAB](https://kijanilab.agency)

---

*Guide créé pour LE RURAL - Janvier 2025*