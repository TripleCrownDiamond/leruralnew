<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'LE RURAL' }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f2;font-family:Arial,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f2;padding:24px 0;">
<tr>
<td align="center">
<table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
<tr>
{{-- Bandeau blanc : le logo de marque est vert, il lui faut un fond clair.
     L'URL doit etre absolue, les chemins relatifs ne fonctionnent pas en e-mail. --}}
<td align="center" style="background:#ffffff;padding:22px 28px 18px;">
<img src="{{ rtrim(config('app.url'), '/') }}/logos/logo.png" width="200" alt="LE RURAL" style="display:block;width:200px;max-width:60%;height:auto;border:0;">
</td>
</tr>
<tr>
<td style="background:linear-gradient(135deg,#10230f 0%,#2f6a11 100%);padding:22px 28px;color:#ffffff;">
<div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;opacity:.85;">{{ $eyebrow ?? 'LE RURAL' }}</div>
<h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">{{ $headline ?? 'Notification' }}</h1>
</td>
</tr>
<tr>
<td style="padding:24px 28px;">
{{ $slot }}
</td>
</tr>
<tr>
<td style="padding:0 28px 24px;">
<p style="margin:0;font-size:12px;color:#6b7280;">LE RURAL - 1er groupe de presse agricole en Afrique de l'Ouest</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
