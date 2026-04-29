@component('emails.layouts.base', ['headline' => 'Nouveau contenu dans votre rubrique', 'eyebrow' => 'LE RURAL / Rubriques'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Un nouvel article vient d'etre publie dans <strong>{{ $category->name_fr }}</strong>.</p>
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;"><strong>{{ $article->title_fr }}</strong></p>
<p style="margin:0;"><a href="{{ route('article.show', $article->slug) }}" style="display:inline-block;background:#2f6a11;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Lire l'article</a></p>
@endcomponent
