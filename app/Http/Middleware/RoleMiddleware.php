<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $userRole = strtolower(trim((string) $request->user()?->role));
        $allowedRoles = collect($roles)
            ->map(fn (string $role) => strtolower(trim($role)))
            ->filter()
            ->values()
            ->all();

        if (empty($allowedRoles) || in_array($userRole, $allowedRoles, true)) {
            return $next($request);
        }

        return redirect()->route('dashboard')->with('error', 'Acces non autorise.');
    }
}