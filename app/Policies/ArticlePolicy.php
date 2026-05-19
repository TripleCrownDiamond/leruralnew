<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin()
            || $user->isEditor()
            || $user->hasPermission('manage_articles')
            || $user->hasPermission('create_articles');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Article $article): bool
    {
        return true; // Anyone can view articles
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin()
            || $user->isEditor()
            || $user->hasPermission('manage_articles')
            || $user->hasPermission('create_articles');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Article $article): bool
    {
        if ($user->isAdmin() || $user->hasPermission('manage_articles')) {
            return true;
        }

        if ($user->isEditor()) {
            return $article->author_id === $user->id;
        }

        return $article->author_id === $user->id
            && ($user->hasPermission('edit_articles') || $user->hasPermission('manage_own_content') || $user->hasPermission('create_articles'));
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Article $article): bool
    {
        if ($user->isAdmin() || $user->hasPermission('manage_articles')) {
            return true;
        }

        if ($user->isEditor()) {
            return $article->author_id === $user->id;
        }

        return $article->author_id === $user->id
            && ($user->hasPermission('edit_articles') || $user->hasPermission('manage_own_content'));
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Article $article): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Article $article): bool
    {
        return false;
    }
}
