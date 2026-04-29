<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public ?string $customMessage = null)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Invitation a rejoindre LE RURAL');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user-invitation',
            with: [
                'user' => $this->user,
                'customMessage' => $this->customMessage,
                'invitationUrl' => route('register', ['token' => $this->user->invitation_token]),
            ]
        );
    }
}