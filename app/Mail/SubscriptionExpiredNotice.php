<?php

namespace App\Mail;

use App\Models\UserSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionExpiredNotice extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public UserSubscription $subscription)
    {
        $this->subscription->loadMissing(['user', 'plan']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre abonnement LE RURAL a expire');
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-expired-notice',
            with: ['subscription' => $this->subscription],
        );
    }
}
