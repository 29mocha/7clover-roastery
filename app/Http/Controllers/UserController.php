<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role; // <-- 1. IMPORT MODEL ROLE

class UserController extends Controller
{
    public function index()
    {
        $this->authorize('manage-app');
        return Inertia::render('Users/Index', [
            // Ambil user beserta rolenya
            'users' => User::with('roles')->orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage-app');
        return Inertia::render('Users/Create', [
            // Kirim daftar role ke frontend
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage-app');
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            // <-- 2. UBAH VALIDASI ROLE
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // 'role' => $request->role, // <-- HAPUS BARIS INI
        ]);

        // <-- 3. GUNAKAN assignRole() UNTUK MEMBERI PERAN
        $user->assignRole($request->role);

        event(new Registered($user));

        return redirect()->route('users.index')->with('success', 'User baru berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $this->authorize('manage-app');
        return Inertia::render('Users/Edit', [
            'user' => $user->load('roles'), // Muat role yang dimiliki user
            'roles' => Role::all()->pluck('name'), // Kirim semua role yang ada
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('manage-app');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            // <-- 4. UBAH VALIDASI ROLE
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        // Update data dasar
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Hanya update password jika diisi
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            $user->save();
        }

        // <-- 5. GUNAKAN syncRoles() UNTUK UPDATE PERAN
        // syncRoles akan menghapus role lama dan memberi role baru.
        $user->syncRoles($validated['role']);

        return Redirect::route('users.index')->with('success', 'Data user berhasil diupdate.');
    }

    public function destroy(User $user)
    {
        $this->authorize('manage-app');
        
        if ($user->id === Auth::id()) {
            return Redirect::back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        // Pastikan user tidak memiliki peran penting sebelum dihapus jika perlu
        // Contoh: if ($user->hasRole('Super-Admin')) { ... }

        $user->delete();

        return Redirect::route('users.index')->with('success', 'User berhasil dihapus.');
    }
}
