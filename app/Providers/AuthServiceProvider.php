<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
{
    Gate::define('manage-app', function (User $user) {
        // Hentikan aplikasi dan tampilkan isi dari $user->role

        // Kode di bawah ini tidak akan pernah dijalankan untuk sementara
        return $user->role === 'admin';
    });
}
}