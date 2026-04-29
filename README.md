# LE RURAL - Guide Complet d'Utilisation

## URL de base
- Production: `https://lerural.bj`

## Roles et acces
- Visiteur: navigation publique.
- Utilisateur connecte: compte, achats, sauvegardes, abonnement.
- Editor: gestion editoriale limitee.
- Admin: acces complet au back-office.

## Tableau rapide (Action -> URL -> Role -> Prerequis)
| Action | URL | Role | Prerequis |
|---|---|---|---|
| Ouvrir l'accueil | `https://lerural.bj/` | Tous | Aucun |
| Rechercher des contenus | `https://lerural.bj/search?q=...` | Tous | Aucun |
| Voir une categorie | `https://lerural.bj/categorie/{slug}` | Tous | Aucun |
| Lire un article | `https://lerural.bj/article/{slug}` | Tous | Aucun |
| Voir la presse ecrite | `https://lerural.bj/presse-ecrite` | Tous | Aucun |
| S'inscrire | `https://lerural.bj/register` | Visiteur | Aucun |
| Se connecter | `https://lerural.bj/login` | Visiteur | Compte existant |
| Profil utilisateur | `https://lerural.bj/profile` | Connecte | Authentification |
| Tableau de bord utilisateur | `https://lerural.bj/dashboard` | Connecte | Auth + email verifie |
| Mes achats | `https://lerural.bj/purchases` | Connecte | Auth |
| Mes sauvegardes | `https://lerural.bj/saved-articles` | Connecte | Auth |
| Mon abonnement | `https://lerural.bj/subscription` | Connecte | Auth |
| Checkout article | `https://lerural.bj/checkout?type=article&id={slugOuId}` | Connecte | Auth + article payant |
| Checkout abonnement | `https://lerural.bj/checkout?type=subscription&id={slugOuId}` | Connecte | Auth |
| Checkout abonnement defaut | `https://lerural.bj/checkout?type=subscription&id=default` | Connecte | Auth |
| Checkout presse ecrite | `https://lerural.bj/checkout?type=paper&id={slugOuId}` | Connecte | Auth |
| Telecharger presse ecrite | `https://lerural.bj/presse-ecrite/{slug}/telecharger` | Connecte | Achat valide ou abonnement avec scope presse |
| Back-office admin | `https://lerural.bj/dashboard` | Admin/Editor | Auth + email verifie + role |
| Mediatheque | `https://lerural.bj/dashboard/media` | Admin/Editor | Auth + role |
| Paiements admin | `https://lerural.bj/dashboard/payments` | Admin | Auth + role admin |
| Utilisateurs admin | `https://lerural.bj/dashboard/users` | Admin | Auth + role admin |
| Plans abonnement admin | `https://lerural.bj/dashboard/subscription-plans` | Admin/Editor | Auth + role |

## Parcours Utilisateur

### Navigation publique
- Accueil: `https://lerural.bj/`
- Version EN: `https://lerural.bj/en`
- Contact: `https://lerural.bj/contact`
- A propos: `https://lerural.bj/a-propos`
- Recherche: `https://lerural.bj/search?q=...`
- API live search: `https://lerural.bj/api/search?q=...`

### Authentification
- Inscription: `https://lerural.bj/register`
- Connexion: `https://lerural.bj/login`
- Mot de passe oublie: `https://lerural.bj/forgot-password`
- Reset: `https://lerural.bj/reset-password/{token}`
- Verification email: `https://lerural.bj/verify-email`

### Espace personnel
- Dashboard: `https://lerural.bj/dashboard`
- Profil: `https://lerural.bj/profile`
- Abonnement: `https://lerural.bj/subscription`
- Achats: `https://lerural.bj/purchases`
- Sauvegardes: `https://lerural.bj/saved-articles`

### Paiements supportes
- MTN MoMo (manuel + preuve)
- Flooz (manuel + preuve)
- Especes (validation admin)
- Kkiapay (si actif)
- Stripe / CinetPay (si actives)

## Parcours Admin

### Contenu
- Articles: `https://lerural.bj/dashboard/articles`
- Categories: `https://lerural.bj/dashboard/categories`
- Emissions: `https://lerural.bj/dashboard/emissions`
- Web TV: `https://lerural.bj/dashboard/web-tv`
- Agendas: `https://lerural.bj/dashboard/agendas`
- Partenaires: `https://lerural.bj/dashboard/partners`
- Publicites: `https://lerural.bj/dashboard/advertisements`
- Annonces: `https://lerural.bj/dashboard/announcements`
- Widgets: `https://lerural.bj/dashboard/widgets`

### Moderation
- Commentaires: `https://lerural.bj/dashboard/comments`
- Reglages commentaires: `https://lerural.bj/dashboard/comments/settings`
- Sondages: `https://lerural.bj/dashboard/polls`
- Resultats: `https://lerural.bj/dashboard/polls/{id}/results`
- Exports: `https://lerural.bj/dashboard/polls/export-all/{format}`

### Commerce et comptes
- Paiements: `https://lerural.bj/dashboard/payments`
- Plans: `https://lerural.bj/dashboard/subscription-plans`
- Souscriptions: `https://lerural.bj/dashboard/subscriptions`
- Utilisateurs: `https://lerural.bj/dashboard/users`
- Presse ecrite admin: `https://lerural.bj/dashboard/press-papers`

### Configuration
- Paiement: `https://lerural.bj/dashboard/settings/payment`
- Reseaux sociaux: `https://lerural.bj/dashboard/settings/socials`
- WhatsApp: `https://lerural.bj/dashboard/settings/whatsapp`
- Integrations CDN/API: `https://lerural.bj/dashboard/settings/integrations`
- Footer: `https://lerural.bj/dashboard/settings/footer`
- Pages statiques: `https://lerural.bj/dashboard/static-pages`
- Mediatheque: `https://lerural.bj/dashboard/media`

## Scenarios pas-a-pas

### Scenario 1: Achat d'un article payant (Utilisateur)
1. Ouvrir un article payant `https://lerural.bj/article/{slug}`.
2. Cliquer acheter et aller sur `https://lerural.bj/checkout?type=article&id={slugOuId}`.
3. Choisir la methode de paiement.
4. Si methode manuelle, envoyer preuve et valider.
5. Suivre le statut dans `https://lerural.bj/purchases`.
6. Une fois valide, l'acces est actif.

### Scenario 2: Achat Presse Ecrite
1. Aller sur `https://lerural.bj/presse-ecrite`.
2. Choisir le numero et lancer checkout `type=paper`.
3. Payer (manuel/especes/auto selon disponibilite).
4. Attendre validation si paiement manuel.
5. Telecharger via `https://lerural.bj/presse-ecrite/{slug}/telecharger`.

### Scenario 3: Paiement en especes + validation admin
1. L'utilisateur choisit `Especes` au checkout.
2. Le paiement est enregistre en `pending`.
3. L'admin ouvre `https://lerural.bj/dashboard/payments`.
4. L'admin confirme ou rejette.
5. Le systeme envoie les emails de notification.
6. En cas de validation, l'achat/souscription est active.

### Scenario 4: Gestion d'un abonnement
1. Utilisateur ouvre `https://lerural.bj/subscription`.
2. Choisit un plan et lance checkout `type=subscription`.
3. Paiement valide.
4. L'abonnement apparait comme actif.
5. Historique visible sur la meme page + achats dans `https://lerural.bj/purchases`.

### Scenario 5: Moderation des commentaires (Admin)
1. Ouvrir `https://lerural.bj/dashboard/comments`.
2. Filtrer les commentaires.
3. Approuver/Rejeter/Supprimer en masse ou unitaire.
4. Ajuster les regles auto sur `.../comments/settings`.

## Support client (copier-coller)

### Contact support LE RURAL
- Site: `https://lerural.bj`
- Formulaire de contact: `https://lerural.bj/contact`
- Compte utilisateur: `https://lerural.bj/dashboard`
- Achats et facturation: `https://lerural.bj/purchases`
- Abonnement: `https://lerural.bj/subscription`
- Presse ecrite: `https://lerural.bj/presse-ecrite`

### Procedure support conseillee
1. Demander l'email du compte client.
2. Verifier si le compte est connecte et email verifie.
3. Verifier le statut du paiement (pending/completed/rejected).
4. Si paiement manuel/especes: informer que la validation admin est necessaire.
5. Rediriger vers la bonne page selon besoin.

### Messages support types
- Paiement en attente: "Votre paiement est bien enregistre et en attente de validation. Vous serez notifie des qu'il est traite."
- Acces refuse presse ecrite: "Votre acces presse ecrite est active apres achat valide ou abonnement incluant la presse ecrite."
- Probleme de connexion: "Utilisez la page mot de passe oublie pour reinitialiser votre acces: https://lerural.bj/forgot-password"

## Securite et controle d'acces
- Routes admin protegees par middleware de role.
- Utilisateur non autorise redirige vers dashboard avec message d'erreur.
- Pages sensibles: auth + verification email.

## Endpoints techniques utiles
- Healthcheck: `https://lerural.bj/up`
- CSRF Sanctum: `https://lerural.bj/sanctum/csrf-cookie`
- Fichiers publics: `https://lerural.bj/storage/{path}`

## Notes d'exploitation
- Utiliser le domaine canonique `https://lerural.bj` dans tous les menus/emails.
- Les slugs (`{slug}`) sont definis dans le back-office.
- Pour partage externe, preferer les URLs avec slug.
