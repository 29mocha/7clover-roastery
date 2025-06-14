<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy; // Jika Anda menggunakan Ziggy untuk route() di JS

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app'; // Pastikan ini sesuai dengan file blade utama Anda (biasanya app.blade.php)

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
            // Tambahkan blok 'can' untuk mengirim izin
            'can' => [
                'manage_app' => $request->user() ? $request->user()->can('manage-app') : false,
            ]
        ],
            // Ini adalah bagian penting untuk FLASH MESSAGES
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                // Anda bisa menambahkan tipe flash message lain jika perlu (info, warning, dll.)
            // Jika Anda menggunakan Ziggy untuk route helper di JavaScr
            ],
        ]);
    }
}