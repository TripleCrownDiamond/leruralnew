# Guide d'Ajout d'une Nouvelle Méthode de Paiement

Pour ajouter une nouvelle méthode de paiement (par exemple "Stripe"), suivez ces 3 étapes simples :

## Étape 1 : Backend (Contrôleur)

1. Ouvrez `app/Http/Controllers/Admin/SettingController.php`
2. Dans la méthode `updatePayment`, ajoutez les nouveaux champs à valider :

```php
'stripe_active' => 'boolean',
'stripe_public_key' => 'nullable|string',
'stripe_secret_key' => 'nullable|string',
```

3. Ouvrez `app/Http/Controllers/PaymentController.php`
4. Dans la méthode `checkout`, ajoutez la condition pour afficher la méthode si elle est active :

```php
if (($settings['stripe_active'] ?? '0') == '1') {
    $gateways[] = [
        'id' => 'stripe', 
        'name' => 'Stripe (Carte Bancaire)', 
        'logo' => '/images/payments/stripe.png'
    ];
}
```

5. Dans la méthode `process`, ajoutez la logique de traitement :

```php
} elseif ($validated['gateway'] === 'stripe') {
    // Logique de vérification Stripe ici
    // ...
    $payment->status = 'completed';
    $this->activateService($payment);
}
```

## Étape 2 : Frontend (Interface Admin)

1. Ouvrez `resources/js/Pages/Admin/Settings/Payment.tsx`
2. Ajoutez les types dans l'interface `SettingsProps` :

```typescript
stripe_active?: string;
stripe_public_key?: string;
stripe_secret_key?: string;
```

3. Initialisez les valeurs dans `useForm` :

```typescript
stripe_active: settings.stripe_active === '1',
stripe_public_key: settings.stripe_public_key || '',
stripe_secret_key: settings.stripe_secret_key || '',
```

4. Ajoutez le bloc UI (copiez-collez le bloc FedaPay et changez les noms) :

```jsx
{/* Stripe Settings */}
<div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 shadow-sm">
    {/* ... En-tête avec Switch ... */}
    
    {data.stripe_active && (
        <div className="grid gap-4...">
            {/* ... Champs Inputs ... */}
        </div>
    )}
</div>
```

## Étape 3 : Frontend (Page de Paiement)

1. Ouvrez `resources/js/Pages/Payment/Checkout.tsx`
2. Ajoutez la gestion du clic dans `handleSubmit` :

```typescript
if (selectedGateway === 'stripe') {
    // Initialiser le widget Stripe ou rediriger
    return;
}
```

C'est tout ! La nouvelle méthode sera automatiquement gérée par le système modulaire.
