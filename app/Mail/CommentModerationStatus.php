<?php

namespace App\Mail;

use App\Models\Comment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommentModerationStatus extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Comment $comment, public string $status)
    {
        $this->comment->loadMissing('article');
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Mise a jour de votre commentaire - LE RURAL');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.comment-moderation-status',
            with: [
                'comment' => $this->comment,
                'status' => $this->status,
            ],
        );
    }
}
