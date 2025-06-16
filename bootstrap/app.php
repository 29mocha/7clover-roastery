<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request; // Ditambahkan untuk TrustProxies

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withProviders([
        // Baris ini dari file asli Anda tetap dipertahankan
        \App\Providers\AuthServiceProvider::class,
    ], true)
    ->withMiddleware(function (Middleware $middleware) {
        // KONFIGURASI DIPERBAIKI: Menggunakan parameter posisional
        $middleware->trustProxies(
             '*', // Parameter pertama untuk proxies
             Request::HEADER_X_FORWARDED_FOR |
             Request::HEADER_X_FORWARDED_HOST |
             Request::HEADER_X_FORWARDED_PORT |
             Request::HEADER_X_FORWARDED_PROTO |
             Request::HEADER_X_FORWARDED_AWS_ELB // Parameter kedua untuk headers
        );

        // Middleware asli Anda tetap dipertahankan
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
