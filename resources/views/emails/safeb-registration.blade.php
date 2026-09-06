@component('emails.layouts.base', ['headline' => 'Nouvelle inscription SAFEB 2026', 'eyebrow' => 'LE RURAL / SAFEB'])
@php
    $labels = [
        'panel' => 'Participant au panel',
        'partner' => 'Partenaire',
        'stand' => 'Reservation de stand',
        'masterclass' => 'Inscription masterclass',
        'pitch' => 'Concours de pitch',
        'culinary' => "Concours d'art culinaire",
    ];
    $typeLabel = $labels[$payload['type']] ?? $payload['type'] ?? 'Inscription';
@endphp
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Une nouvelle inscription a ete recue pour le <strong>SAFEB 2026</strong> (Salon de l'Autonomisation de la Femme Entrepreneure Rurale du Benin, Parakou - 15 au 17 octobre 2026).</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Type:</strong> {{ $typeLabel }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Nom:</strong> {{ $payload['name'] }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Email:</strong> {{ $payload['email'] }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Telephone:</strong> {{ $payload['phone'] ?: 'Non renseigne' }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Organisation:</strong> {{ $payload['organization'] ?: 'Non renseignee' }}</td></tr>
@if (!empty($payload['option_label']))
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Option choisie:</strong> {{ $payload['option_label'] }}</td></tr>
@endif
<tr><td style="padding:8px 0;font-size:13px;"><strong>Recue le:</strong> {{ $payload['submitted_at'] }}</td></tr>
</table>
@if (!empty($payload['message']))
<div style="margin:14px 0 0;border:1px solid #e5e7eb;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;background:#f9fafb;white-space:pre-line;">{{ $payload['message'] }}</div>
@endif
@endcomponent
