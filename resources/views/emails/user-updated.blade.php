@component('emails.layouts.base', ['headline' => 'Mise a jour de votre compte', 'eyebrow' => 'LE RURAL / Comptes'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Bonjour {{ $user->name }}, vos informations de compte ont ete mises a jour.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Nom:</strong> {{ $user->name }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Email:</strong> {{ $user->email }}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eef2f7;font-size:13px;"><strong>Role:</strong> {{ ucfirst($user->role) }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;"><strong>Statut:</strong> {{ ucfirst($user->status) }}</td></tr>
</table>
@if($customMessage)
<div style="margin:14px 0 0;border:1px solid #e5e7eb;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;background:#f9fafb;white-space:pre-line;">{{ $customMessage }}</div>
@endif
@endcomponent
