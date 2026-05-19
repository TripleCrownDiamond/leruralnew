@component('emails.layouts.base', ['headline' => 'Verification de votre email', 'eyebrow' => 'LE RURAL / Compte'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Bonjour {{ $user->name ?? 'Utilisateur' }}, confirmez votre adresse email pour activer votre compte.</p>
<p style="margin:0 0 14px;"><a href="{{ $url }}" style="display:inline-block;background:#2f6a11;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Verifier mon email</a></p>
<p style="margin:0;font-size:12px;color:#6b7280;">Si vous n'avez pas cree de compte, ignorez cet email.</p>
@endcomponent
