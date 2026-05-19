<?php

namespace App\Http\Controllers;

use App\Models\UserNotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupère les notifications de l'utilisateur connecté
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['notifications' => [], 'unread_count' => 0]);
        }

        $notifications = $user->notifications()
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->data['type'] ?? 'general',
                'title' => $notification->data['title'] ?? '',
                'message' => $notification->data['message'] ?? '',
                'url' => $notification->data['url'] ?? null,
                'thumbnail' => $notification->data['thumbnail'] ?? null,
                'read' => $notification->read_at !== null,
                'created_at' => $notification->created_at->toIso8601String(),
                'created_human' => $notification->created_at->diffForHumans(),
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Marque une notification comme lue
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $notification = $user->notifications()->find($id);
        
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Marque toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'unread_count' => 0,
        ]);
    }

    /**
     * Supprime une notification
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $notification = $user->notifications()->find($id);
        
        if ($notification) {
            $notification->delete();
        }

        return response()->json([
            'success' => true,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Récupère les préférences de notification
     */
    public function preferences(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $prefs = UserNotificationPreference::getOrCreateForUser($user->id);

        return response()->json([
            'preferences' => [
                'live_start_email' => $prefs->live_start_email,
                'live_start_push' => $prefs->live_start_push,
                'live_reminder_email' => $prefs->live_reminder_email,
                'live_reminder_push' => $prefs->live_reminder_push,
                'new_article_email' => $prefs->new_article_email,
                'new_article_push' => $prefs->new_article_push,
                'subscription_email' => $prefs->subscription_email,
                'marketing_email' => $prefs->marketing_email,
            ],
        ]);
    }

    /**
     * Met à jour les préférences de notification
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $validated = $request->validate([
            'live_start_email' => 'boolean',
            'live_start_push' => 'boolean',
            'live_reminder_email' => 'boolean',
            'live_reminder_push' => 'boolean',
            'new_article_email' => 'boolean',
            'new_article_push' => 'boolean',
            'subscription_email' => 'boolean',
            'marketing_email' => 'boolean',
        ]);

        $prefs = UserNotificationPreference::getOrCreateForUser($user->id);
        $prefs->update($validated);

        // Met aussi à jour les champs simplifiés sur User
        $user->update([
            'notify_live_start' => $validated['live_start_email'] ?? $prefs->live_start_email,
            'notify_new_content' => $validated['new_article_email'] ?? $prefs->new_article_email,
        ]);

        return response()->json([
            'success' => true,
            'preferences' => $prefs->fresh(),
        ]);
    }
}