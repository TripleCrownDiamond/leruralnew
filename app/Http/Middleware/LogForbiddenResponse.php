<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogForbiddenResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response->getStatusCode() === 403) {
            $user = $request->user();

            Log::warning('HTTP 403 response', [
                'reason' => 'response_status_403',
                'path' => $request->path(),
                'full_url' => $request->fullUrl(),
                'method' => $request->method(),
                'route_name' => optional($request->route())->getName(),
                'ip' => $request->ip(),
                'user_id' => $user?->id,
                'user_role' => $user?->role,
                'referer' => $request->headers->get('referer'),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }
}
