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
use Illuminate\Support\Facades\Auth; // <-- Pastikan import ini ada

class UserController extends Controller
{
    public function __construct()
    {
        // Untuk sementara kita proteksi manual per method dengan Gate
    }

    public function index()
    {
        $this->authorize('manage-app');
        return Inertia::render('Users/Index', [
            'users' => User::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage-app');
        return Inertia::render('Users/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('manage-app');
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'role' => ['required', 'string', Rule::in(['admin', 'roaster'])],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        return redirect()->route('users.index')->with('success', 'User baru berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $this->authorize('manage-app');
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

   /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('manage-app');

        // ==== PERBAIKAN UTAMA DI SINI PADA ATURAN VALIDASI EMAIL ====
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(['admin', 'roaster'])],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        // Update data dasar
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        // Hanya update password jika diisi
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return Redirect::route('users.index')->with('success', 'Data user berhasil diupdate.');
    }


    public function destroy(User $user)
    {
        $this->authorize('manage-app');
        
        // ==== PERBAIKAN DI SINI ====
        // Ganti auth()->id() dengan Auth::id()
        if ($user->id === Auth::id()) {
            return Redirect::back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return Redirect::route('users.index')->with('success', 'User berhasil dihapus.');
    }
}