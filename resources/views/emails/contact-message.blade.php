@component('emails.layouts.base', ['headline' => 'Nouveau message contact', 'eyebrow' => 'LE RURAL / Contact'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Un visiteur a envoye un message depuis le formulaire de contact.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Nom:</strong> {{ $payload['name'] }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Email:</strong> {{ $payload['email'] }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Telephone:</strong> {{ $payload['phone'] ?: 'Non renseigne' }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Sujet:</strong> {{ $payload['subject'] }}</td></tr>
</table>
<div style="margin:14px 0 0;border:1px solid #e5e7eb;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;background:#f9fafb;white-space:pre-line;">{{ $payload['message'] }}</div>
@endcomponent
