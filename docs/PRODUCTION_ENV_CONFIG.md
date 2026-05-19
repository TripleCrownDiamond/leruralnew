# LE RURAL - Configuration Production (.env)

Copiez cette configuration dans votre fichier `.env` sur le serveur de production.

## Configuration complète

```env
#==============================================================================
# LE RURAL - Configuration Production
#==============================================================================

#------------------------------------------------------------------------------
# Application
#------------------------------------------------------------------------------
APP_NAME="LE RURAL"
APP_ENV=production
APP_KEY=base64:VOTRE_CLE_GENEREE_ICI
APP_DEBUG=false
APP_TIMEZONE="Africa/Porto-Novo"
APP_URL=https://lerural.bj
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr

#------------------------------------------------------------------------------
# Base de données
#------------------------------------------------------------------------------
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lerural_prod
DB_USERNAME=lerural_user
DB_PASSWORD="VOTRE_MOT_DE_PASSE_DB"

#------------------------------------------------------------------------------
# Session (CRUCIAL pour éviter CSRF token mismatch)
#------------------------------------------------------------------------------
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.lerural.bj
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_PARTITIONED_COOKIE=false

#------------------------------------------------------------------------------
# Cache & Queue
#------------------------------------------------------------------------------
CACHE_STORE=database
QUEUE_CONNECTION=database
BROADCAST_CONNECTION=log

#------------------------------------------------------------------------------
# Filesystem
#------------------------------------------------------------------------------
FILESYSTEM_DISK=local

#------------------------------------------------------------------------------
# Mail (Configurez selon votre provider)
#------------------------------------------------------------------------------
MAIL_MAILER=smtp
MAIL_HOST=smtp.votre-provider.com
MAIL_PORT=587
MAIL_USERNAME=contact@lerural.bj
MAIL_PASSWORD="VOTRE_MOT_DE_PASSE_MAIL"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=contact@lerural.bj
MAIL_FROM_NAME="${APP_NAME}"

#------------------------------------------------------------------------------
# Cloudinary (CDN pour les médias)
#------------------------------------------------------------------------------
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

#------------------------------------------------------------------------------
# Paiements - Kkiapay
#------------------------------------------------------------------------------
KKIAPAY_PUBLIC_KEY=votre_public_key
KKIAPAY_PRIVATE_KEY=votre_private_key
KKIAPAY_SECRET=votre_secret
KKIAPAY_SANDBOX=false

#------------------------------------------------------------------------------
# Paiements - Stripe (optionnel)
#------------------------------------------------------------------------------
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

#------------------------------------------------------------------------------
# Paiements - CinetPay (optionnel)
#------------------------------------------------------------------------------
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=

#------------------------------------------------------------------------------
# Logging
#------------------------------------------------------------------------------
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

#------------------------------------------------------------------------------
# Vite (pour le build)
#------------------------------------------------------------------------------
VITE_APP_NAME="${APP_NAME}"

#------------------------------------------------------------------------------
# Sécurité additionnelle
#------------------------------------------------------------------------------
BCRYPT_ROUNDS=12
```

---

## ⚠️ Variables CRITIQUES pour le CSRF

Ces variables sont **essentielles** pour éviter l'erreur "CSRF token mismatch" :

| Variable | Valeur | Explication |
|----------|--------|-------------|
| `SESSION_DRIVER` | `database` | Stockage persistant des sessions |
| `SESSION_DOMAIN` | `.lerural.bj` | Le point permet les sous-domaines |
| `SESSION_SECURE_COOKIE` | `true` | Obligatoire en HTTPS |
| `SESSION_SAME_SITE` | `lax` | Protection CSRF standard |
| `APP_URL` | `https://lerural.bj` | URL complète avec HTTPS |

---

## 📋 Instructions de déploiement

### 1. Copier la configuration
```bash
# Sur le serveur, créez/éditez le fichier .env
nano .env
# Collez la configuration ci-dessus
```

### 2. Générer la clé d'application
```bash
php artisan key:generate
```

### 3. Configurer les valeurs réelles
Remplacez les placeholders :
- `VOTRE_MOT_DE_PASSE_DB`
- `VOTRE_MOT_DE_PASSE_MAIL`
- Credentials Cloudinary
- Credentials Kkiapay

### 4. Exécuter les migrations
```bash
php artisan migrate --force
```

### 5. Vérifier que la table sessions existe
```bash
php artisan tinker
>>> Schema::hasTable('sessions')
# Doit retourner true
```

### 6. Vider et régénérer les caches
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7. Vérifier les permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 🔧 Dépannage CSRF

### Si le problème persiste après configuration :

1. **Vérifiez que le cookie de session est bien envoyé :**
   ```bash
   # Dans le navigateur, ouvrez DevTools > Application > Cookies
   # Cherchez le cookie "lerural-session" (ou le nom configuré)
   ```

2. **Testez avec le driver file temporairement :**
   ```env
   SESSION_DRIVER=file
   ```

3. **Vérifiez la configuration du serveur web (Nginx/Apache) :**
   - Les headers doivent être correctement transmis
   - Le proxy ne doit pas supprimer les cookies

4. **Configuration Nginx recommandée :**
   ```nginx
   location / {
       try_files $uri $uri/ /index.php?$query_string;
   }
   
   location ~ \.php$ {
       fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
       fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
       include fastcgi_params;
       
       # Important pour les sessions
       fastcgi_param HTTP_X_FORWARDED_PROTO $scheme;
   }
   ```

5. **Si derrière un load balancer/proxy :**
   Ajoutez dans `App\Http\Middleware\TrustProxies` :
   ```php
   protected $proxies = '*';
   ```

---

## 🔄 Script de déploiement rapide

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement LE RURAL..."

# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build frontend
npm ci
npm run build

# Fix permissions
chmod -R 775 storage bootstrap/cache

echo "✅ Déploiement terminé!"
```

---

## 📞 Support

En cas de problème persistant :
1. Vérifiez les logs : `tail -f storage/logs/laravel.log`
2. Testez l'endpoint : `curl -I https://lerural.bj/sanctum/csrf-cookie`
3. Vérifiez la réponse des headers de session

---

## 🔄 Modifications apportées au code

Les fichiers suivants ont été modifiés pour améliorer la gestion CSRF :

### 1. `resources/js/lib/csrf.ts` (NOUVEAU)
Utilitaire centralisé pour la gestion des tokens CSRF avec :
- `getCsrfToken()` - Récupère le token depuis meta tag ou cookie
- `getCsrfHeaders()` - Retourne les headers pour les requêtes AJAX
- `appendCsrfToFormData()` - Ajoute le token à un FormData
- `configureCsrfXhr()` - Configure un XMLHttpRequest avec CSRF
- `isCsrfError()` - Vérifie si une erreur est 419
- `handleCsrfError()` - Gère l'erreur avec rechargement auto
- `csrfFetch()` - Wrapper fetch avec gestion CSRF
- `uploadFileWithProgress()` - Upload avec progression et CSRF

### 2. `resources/js/Components/CloudinaryUpload.tsx`
- Utilise maintenant le module `@/lib/csrf`
- Gestion automatique de l'erreur 419 avec rechargement de page
- Code simplifié et maintenable

### 3. `resources/js/Components/TiptapEditor.tsx`
- Utilise maintenant le module `@/lib/csrf`
- Gestion de l'erreur CSRF lors de l'upload d'images dans l'éditeur

### 4. `app/Http/Middleware/TrustProxies.php` (NOUVEAU)
- Middleware pour gérer les reverse proxies (Nginx, Cloudflare)
- Essentiel pour la détection correcte de HTTPS
- Configure la confiance pour tous les proxies

### 5. `bootstrap/app.php`
- Ajout de `trustProxies(at: '*')` pour activer le middleware

---

---

## 🔔 Système de Notifications (NOUVEAU)

Un système complet de notifications a été ajouté :

### Fonctionnalités
- **Notifications de live** : Email + site quand un live démarre
- **Rappels** : 15 min et 5 min avant le début d'un live
- **Icône cloche** : Dans le header avec badge de compteur
- **Toast live** : Notification popup quand un live démarre pendant la navigation
- **Préférences utilisateur** : Page de gestion dans le profil

### Fichiers créés

#### Backend (PHP)
- `app/Models/UserNotificationPreference.php` - Préférences utilisateur
- `app/Models/LiveStreamNotification.php` - Tracking des notifs envoyées
- `app/Notifications/LiveStreamStarted.php` - Notification de démarrage
- `app/Notifications/LiveStreamReminder.php` - Notification de rappel
- `app/Services/LiveNotificationService.php` - Service d'envoi
- `app/Http/Controllers/NotificationController.php` - API notifications
- `app/Console/Commands/ProcessLiveNotifications.php` - Commande cron
- `database/migrations/2026_05_10_000001_create_notifications_system.php`
- `database/migrations/2026_05_10_000002_add_live_stream_settings.php`

#### Frontend (React/TypeScript)
- `resources/js/Components/NotificationBell.tsx` - Icône cloche avec dropdown
- `resources/js/Components/LiveNotificationToast.tsx` - Toast popup live
- `resources/js/Pages/Profile/Partials/NotificationPreferencesForm.tsx` - Préférences

### Configuration Cron

Ajoutez ce cron sur le serveur pour traiter les notifications :

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Ou exécutez manuellement :
```bash
php artisan live:notify
```

### Variables d'environnement pour les emails

Assurez-vous que la configuration mail est correcte :
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.votre-provider.com
MAIL_PORT=587
MAIL_USERNAME=contact@lerural.bj
MAIL_PASSWORD="VOTRE_MOT_DE_PASSE"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=contact@lerural.bj
MAIL_FROM_NAME="LE RURAL"
```

---

## 🎬 Améliorations du Système de Streaming

### Nouvelles fonctionnalités
- **Support YouTube Live** : URLs `/live/VIDEO_ID` et `@channel/live`
- **Durées configurables** : Via les settings (jingle et émissions)
- **Gestion d'erreur iframe** : Détection et fallback automatique
- **Bouton retry** : En cas d'échec de chargement

### Settings disponibles

| Clé | Valeur par défaut | Description |
|-----|-------------------|-------------|
| `live_jingle_duration_seconds` | 90 | Durée du jingle (secondes) |
| `live_emission_duration_seconds` | 720 | Durée des émissions (12 min) |
| `live_auto_refresh_seconds` | 60 | Intervalle de refresh auto |

---

## ✅ Checklist de vérification post-déploiement

```bash
# 1. Vérifier que HTTPS est détecté
curl -I https://lerural.bj | grep -i "set-cookie"
# Doit contenir "Secure" dans les cookies

# 2. Vérifier le token CSRF
curl -c cookies.txt https://lerural.bj/sanctum/csrf-cookie
cat cookies.txt | grep XSRF
# Doit montrer le cookie XSRF-TOKEN

# 3. Tester un upload (depuis le navigateur)
# - Connectez-vous en admin
# - Allez sur /dashboard/articles/create
# - Essayez d'uploader une image
# - Vérifiez la console pour les erreurs

# 4. Vérifier les logs en cas d'erreur
tail -100 storage/logs/laravel.log | grep -i csrf
```