@component('emails.layouts.base', ['headline' => 'Mise a jour de votre commentaire', 'eyebrow' => 'LE RURAL / Commentaires'])
<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">Votre commentaire sur <strong>{{ $comment->article?->title_fr ?? 'un article' }}</strong> a ete <strong>{{ $status === 'approved' ? 'approuve' : 'rejete' }}</strong>.</p>
<div style="margin:0 0 14px;border:1px solid #e5e7eb;border-radius:10px;padding:12px;font-size:13px;line-height:1.6;background:#f9fafb;">
{{ $comment->content }}
</div>
@if($status === 'approved' && $comment->article)
<p style="margin:0;"><a href="{{ route('article.show', $comment->article->slug) }}" style="display:inline-block;background:#2f6a11;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Voir l'article</a></p>
@endif
@endcomponent
