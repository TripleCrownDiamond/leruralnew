<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    const ROLE_ADMIN = 'admin';
    const ROLE_EDITOR = 'editor';
    const ROLE_CLIENT = 'client';
    const ROLE_USER = 'user';

        protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'status',
        'permissions',
        'invitation_token',
        'invitation_expires_at',
        'email_verified_at',
        'last_login_at',
        'notify_live_start',
        'notify_new_content',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'invitation_token',
    ];

        protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
            'invitation_expires_at' => 'datetime',
            'last_login_at' => 'datetime',
            'notify_live_start' => 'boolean',
            'notify_new_content' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isEditor(): bool
    {
        return $this->role === self::ROLE_EDITOR;
    }

    public function isClient(): bool
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions ?? [], true);
    }

    public function articles()
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function savedArticles()
    {
        return $this->hasMany(SavedArticle::class);
    }

    public function articleLikes()
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function commentLikes()
    {
        return $this->hasMany(CommentLike::class);
    }

        public function followedCategories()
    {
        return $this->belongsToMany(Category::class, 'category_user_follows')->withTimestamps();
    }

    public function notificationPreferences()
    {
        return $this->hasOne(UserNotificationPreference::class);
    }

    /**
     * Récupère les notifications non lues
     */
    public function unreadNotificationsCount(): int
    {
        return $this->unreadNotifications()->count();
    }

    /**
     * Récupère les notifications récentes (lues et non lues)
     */
    public function recentNotifications(int $limit = 20)
    {
        return $this->notifications()->latest()->take($limit)->get();
    }
}
