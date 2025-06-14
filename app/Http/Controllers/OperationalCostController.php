<?php

namespace App\Http\Controllers;

use App\Models\OperationalCost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class OperationalCostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('OperationalCosts/Index', [
            'operationalCosts' => OperationalCost::orderBy('nama_biaya')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('OperationalCosts/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_biaya' => 'required|string|max:255|unique:operational_costs,nama_biaya',
            'tipe_biaya' => ['required', 'string', Rule::in(['per_jam', 'per_batch'])],
            'nilai_biaya' => 'required|numeric|min:0',
            'satuan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string',
        ]);

        OperationalCost::create($validatedData);

        return Redirect::route('operational-costs.index')->with('success', 'Biaya operasional berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     * Kita mungkin tidak butuh halaman show terpisah, bisa langsung ke edit.
     * Tapi kita siapkan saja untuk konsistensi.
     */
    public function show(OperationalCost $operationalCost)
    {
        return Redirect::route('operational-costs.edit', $operationalCost);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OperationalCost $operationalCost)
    {
        return Inertia::render('OperationalCosts/Edit', [
            'operationalCost' => $operationalCost,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OperationalCost $operationalCost)
    {
        $validatedData = $request->validate([
            'nama_biaya' => 'required|string|max:255|unique:operational_costs,nama_biaya,'.$operationalCost->id,
            'tipe_biaya' => ['required', 'string', Rule::in(['per_jam', 'per_batch'])],
            'nilai_biaya' => 'required|numeric|min:0',
            'satuan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string',
        ]);

        $operationalCost->update($validatedData);

        return Redirect::route('operational-costs.index')->with('success', 'Biaya operasional berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OperationalCost $operationalCost)
    {
        // Di masa depan, kita bisa tambahkan pengecekan apakah biaya ini sedang digunakan
        // sebelum mengizinkan penghapusan. Untuk saat ini, kita langsung hapus.
        $operationalCost->delete();

        return Redirect::route('operational-costs.index')->with('success', 'Biaya operasional berhasil dihapus.');
    }
}