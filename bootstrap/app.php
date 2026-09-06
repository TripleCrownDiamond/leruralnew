<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust proxies for app behind reverse proxy/CDN.
        $middleware->trustProxies(at: '*');

        $middleware->append([
            \App\Http\Middleware\LogForbiddenResponse::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ], prepend: [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\TrackPageViews::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (\Throwable $exception): void {
            $isForbidden = $exception instanceof AuthorizationException
                || $exception instanceof AccessDeniedHttpException
                || ($exception instanceof HttpExceptionInterface && $exception->getStatusCode() === 403);

            if (!$isForbidden) {
                return;
            }

            $request = app()->bound('request') ? app('request') : null;
            if (!$request instanceof Request) {
                Log::warning('HTTP 403 exception (no request context)', [
                    'reason' => 'exception_403_no_request',
                    'exception' => $exception::class,
                    'message' => $exception->getMessage(),
                ]);

                return;
            }

            $user = $request->user();

            Log::warning('HTTP 403 exception', [
                'reason' => 'exception_403',
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
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
        });
    })->create();

