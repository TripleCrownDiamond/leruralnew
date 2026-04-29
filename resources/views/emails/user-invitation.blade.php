@component('emails.layouts.base', ['headline' => 'Invitation a rejoindre la plateforme', 'eyebrow' => 'LE RURAL / Comptes'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Bonjour {{ $user->name }}, vous avez ete invite a rejoindre LE RURAL.</p>
@if($customMessage)
<div style="margin:0 0 14px;border:1px solid #e5e7eb;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;background:#f9fafb;white-space:pre-line;">{{ $customMessage }}</div>
@endif
<p style="margin:0 0 14px;"><a href="{{ $invitationUrl }}" style="display:inline-block;background:#2f6a11;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Creer mon compte</a></p>
@endcomponent
