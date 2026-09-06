@component('emails.layouts.base', ['headline' => 'Votre inscription est confirmee', 'eyebrow' => 'LE RURAL / SAFEB 2026'])
@php
    $labels = [
        'panel' => 'Participant au panel',
        'partner' => 'Partenaire',
        'stand' => 'Reservation de stand',
        'masterclass' => 'Inscription masterclass',
        'pitch' => 'Concours de pitch',
        'culinary' => "Concours d'art culinaire",
    ];
    $typeLabel = $payload['type_label'] ?? ($labels[$payload['type']] ?? $payload['type'] ?? 'Inscription');

    $nextSteps = [
        'panel' => 'Vous serez contacte(e) prochainement avec le programme detaille des panels et les informations pratiques (horaires, salle).',
        'partner' => 'Notre equipe vous contactera sous peu pour finaliser les modalites de votre partenariat (pack, visibilite, logistique).',
        'stand' => 'Notre equipe vous contactera pour confirmer votre emplacement exact et vous transmettre les conditions d\'installation.',
        'masterclass' => 'Vous recevrez prochainement le programme detaille des sessions de la masterclass ainsi que les informations pratiques.',
        'pitch' => 'Vous recevrez prochainement les consignes de candidature (format de presentation, duree, dossier) pour le concours de pitch.',
        'culinary' => 'Vous recevrez prochainement les modalites du concours d\'art culinaire (espaces, materiel, degustation).',
    ];
    $nextStep = $nextSteps[$payload['type']] ?? 'Notre equipe vous contactera tres prochainement.';
@endphp
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Bonjour <strong>{{ $payload['name'] }}</strong>,</p>
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Nous avons le plaisir de vous confirmer votre inscription au <strong>SAFEB 2026</strong> (Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin).</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Type d'inscription:</strong> {{ $typeLabel }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Nom:</strong> {{ $payload['name'] }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Email:</strong> {{ $payload['email'] }}</td></tr>
@if (!empty($payload['option_label']))
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Option choisie:</strong> {{ $payload['option_label'] }}</td></tr>
@endif
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Lieu:</strong> Parakou, Benin</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Dates:</strong> 15 au 17 octobre 2026</td></tr>
</table>
<div style="margin:14px 0 0;border:1px solid #bbf7d0;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;background:#f0fdf4;color:#14532d;">
<strong>Prochaines etapes:</strong> {{ $nextStep }}
</div>
<p style="margin:14px 0 0;font-size:13px;line-height:1.6;">Pour toute question, repondez simplement a cet email ou contactez l'equipe SAFEB 2026.</p>
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;">A tres bientot,<br><strong>L'equipe SAFEB 2026 - LE RURAL</strong></p>
@endcomponent
