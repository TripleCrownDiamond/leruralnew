<?php

namespace App\Mail;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CategoryArticlePublished extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Category $category, public Article $article)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Nouveau dans ' . $this->category->name_fr . ' - LE RURAL');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.category-article-published',
            with: [
                'category' => $this->category,
                'article' => $this->article,
            ],
        );
    }
}
