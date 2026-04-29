@component('emails.layouts.base', ['headline' => 'Reinitialisation du mot de passe', 'eyebrow' => 'LE RURAL / Securite'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Bonjour {{ $user->name ?? 'Utilisateur' }}, cliquez sur le bouton ci-dessous pour definir un nouveau mot de passe.</p>
<p style="margin:0 0 14px;"><a href="{{ $url }}" style="display:inline-block;background:#2f6a11;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Reinitialiser le mot de passe</a></p>
<p style="margin:0;font-size:12px;color:#6b7280;">Ce lien expire dans {{ $minutes }} minutes.</p>
@endcomponent
