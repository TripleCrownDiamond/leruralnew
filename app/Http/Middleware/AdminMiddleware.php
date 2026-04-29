<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return redirect()->route('dashboard')->with('error', 'Acces administrateur requis.');
        }

        return $next($request);
    }
}