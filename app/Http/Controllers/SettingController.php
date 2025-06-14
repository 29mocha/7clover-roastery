<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
// use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // Ini tidak lagi diperlukan di sini

class SettingController extends Controller
{
    // trait 'use AuthorizesRequests;' juga tidak lagi diperlukan di sini

    public function index()
    {
        $this->authorize('manage-app'); // Ini akan berfungsi sekarang

        $settings = Setting::all()->keyBy('key');

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $this->authorize('manage-app');

        $settings = Setting::all();
        $rules = [];

        foreach ($settings as $setting) {
            $rule = 'nullable';
            if ($setting->type === 'number') {
                $rule .= '|numeric';
            } else {
                $rule .= '|string';
            }
            $rules[$setting->key] = $rule;
        }

        $validatedData = $request->validate($rules);

        foreach ($validatedData as $key => $value) {
            Setting::where('key', $key)->update(['value' => $value]);
        }
        
        Cache::forget('settings'); // Praktik baik untuk membersihkan cache

        return Redirect::back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}