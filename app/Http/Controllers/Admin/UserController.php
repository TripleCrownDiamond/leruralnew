<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends AdminController
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->string('role')->toString() !== 'all') {
            $query->where('role', $request->string('role')->toString());
        }

        if ($request->filled('status') && $request->string('status')->toString() !== 'all') {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('verified') && $request->string('verified')->toString() !== 'all') {
            if ($request->string('verified')->toString() === 'verified') {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        $users = $query
            ->withCount([
                'articles',
                'subscriptions as active_subscriptions' => function ($q) {
                    $q->where('status', 'active');
                },
                'payments',
                'comments',
            ])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->get('search'),
                'role' => $request->get('role', 'all'),
                'status' => $request->get('status', 'all'),
                'verified' => $request->get('verified', 'all'),
            ],
            'roles' => $this->getRoles(),
            'permissions' => $this->getPermissions(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => $this->getRoles(),
            'permissions' => $this->getPermissions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'role' => ['required', 'string', Rule::in(array_column($this->getRoles(), 'value'))],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(array_column($this->getPermissions(), 'value'))],
            'send_invitation' => ['boolean'],
            'custom_message' => ['nullable', 'string', 'max:1000'],
        ]);

        $sendInvitation = (bool) ($validated['send_invitation'] ?? false);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make(Str::random(16)),
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
            'status' => $sendInvitation ? 'invited' : 'active',
            'email_verified_at' => $sendInvitation ? null : now(),
        ]);

        if ($sendInvitation) {
            $user->invitation_token = Str::random(60);
            $user->invitation_expires_at = now()->addDays(7);
            $user->save();

            try {
                Mail::to($user->email)->send(new \App\Mail\UserInvitation($user, $validated['custom_message'] ?? null));
            } catch (\Exception $e) {
                \Log::error('Failed to send invitation email: ' . $e->getMessage());
            }
        }

        return redirect()->route('dashboard.users.index')
            ->with('success', 'Utilisateur cree avec succes.');
    }

    public function show(User $user)
    {
        $user->load(['articles', 'subscriptions', 'payments', 'comments']);

        $recentActivity = collect([
            [
                'id' => 1,
                'type' => 'login',
                'description' => 'Derniere connexion',
                'created_at' => $user->last_login_at,
            ],
            [
                'id' => 2,
                'type' => 'article_created',
                'description' => 'Article publie',
                'created_at' => optional($user->articles)->max('created_at'),
            ],
            [
                'id' => 3,
                'type' => 'payment',
                'description' => 'Paiement effectue',
                'created_at' => optional($user->payments)->max('created_at'),
            ],
            [
                'id' => 4,
                'type' => 'comment',
                'description' => 'Commentaire poste',
                'created_at' => optional($user->comments)->max('created_at'),
            ],
        ])
            ->filter(fn ($activity) => $activity['created_at'])
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'roles' => $this->getRoles(),
            'permissions' => $this->getPermissions(),
            'recentActivity' => $recentActivity,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $this->getRoles(),
            'permissions' => $this->getPermissions(),
            'currentUser' => auth()->user(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(array_column($this->getRoles(), 'value'))],
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(array_column($this->getPermissions(), 'value'))],
            'status' => ['required', 'string', Rule::in(['active', 'inactive', 'invited', 'suspended'])],
            'send_notification' => ['boolean'],
            'custom_message' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'status' => $validated['status'],
            'permissions' => $validated['permissions'] ?? [],
        ]);

        if (!empty($validated['send_notification'])) {
            try {
                Mail::to($user->email)->send(new \App\Mail\UserUpdated($user, $validated['custom_message'] ?? null));
            } catch (\Exception $e) {
                \Log::error('Failed to send user update email: ' . $e->getMessage());
            }
        }

        return redirect()->route('dashboard.users.edit', $user)
            ->with('success', 'Utilisateur mis a jour avec succes.');
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin' && User::where('role', 'admin')->count() === 1) {
            return back()->with('error', 'Impossible de supprimer le dernier administrateur.');
        }

        $user->delete();

        return redirect()->route('dashboard.users.index')
            ->with('success', 'Utilisateur supprime avec succes.');
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['required', 'integer', 'exists:users,id'],
        ]);

        $userIds = $validated['user_ids'];

        $adminCount = User::whereIn('id', $userIds)->where('role', 'admin')->count();
        $totalAdmins = User::where('role', 'admin')->count();

        if ($adminCount > 0 && $totalAdmins === $adminCount) {
            return back()->with('error', 'Impossible de supprimer tous les administrateurs.');
        }

        User::whereIn('id', $userIds)->delete();

        return back()->with('success', count($userIds) . ' utilisateur(s) supprime(s) avec succes.');
    }

    public function resendInvitation(User $user)
    {
        if ($user->status !== 'invited') {
            return back()->with('error', 'Seuls les utilisateurs invites peuvent recevoir une nouvelle invitation.');
        }

        $user->invitation_token = Str::random(60);
        $user->invitation_expires_at = now()->addDays(7);
        $user->save();

        try {
            Mail::to($user->email)->send(new \App\Mail\UserInvitation($user));
            return back()->with('success', 'Invitation renvoyee avec succes.');
        } catch (\Exception $e) {
            \Log::error('Failed to resend invitation email: ' . $e->getMessage());
            return back()->with('error', "Echec de l'envoi de l'invitation.");
        }
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $user->update(['status' => $validated['status']]);

        return back()->with('success', "Statut de l'utilisateur mis a jour avec succes.");
    }

    private function getRoles(): array
    {
        return [
            ['value' => 'admin', 'label' => 'Administrateur'],
            ['value' => 'moderator', 'label' => 'Moderateur'],
            ['value' => 'editor', 'label' => 'Editeur'],
            ['value' => 'user', 'label' => 'Utilisateur'],
        ];
    }

    private function getPermissions(): array
    {
        return [
            ['value' => 'manage_users', 'label' => 'Gerer les utilisateurs'],
            ['value' => 'manage_articles', 'label' => 'Gerer les articles'],
            ['value' => 'moderate_comments', 'label' => 'Moderer les commentaires'],
            ['value' => 'create_articles', 'label' => 'Creer des articles'],
            ['value' => 'edit_articles', 'label' => 'Editer des articles'],
            ['value' => 'manage_own_content', 'label' => 'Gerer son propre contenu'],
            ['value' => 'view_content', 'label' => 'Voir le contenu'],
            ['value' => 'comment', 'label' => 'Commenter'],
            ['value' => 'manage_categories', 'label' => 'Gerer les categories'],
            ['value' => 'manage_settings', 'label' => 'Gerer les parametres'],
            ['value' => 'view_analytics', 'label' => 'Voir les analytics'],
        ];
    }
}

