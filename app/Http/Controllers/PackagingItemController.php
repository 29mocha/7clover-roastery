<?php

namespace App\Http\Controllers;

use App\Models\PackagingItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class PackagingItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('PackagingItems/Index', [
            'packagingItems' => PackagingItem::orderBy('nama_item')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('PackagingItems/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nama_item' => 'required|string|max:255|unique:packaging_items,nama_item',
            'tipe_item' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'biaya_per_item' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        PackagingItem::create($validatedData);

        return Redirect::route('packaging-items.index')->with('success', 'Item kemasan berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PackagingItem $packagingItem)
    {
        return Redirect::route('packaging-items.edit', $packagingItem);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PackagingItem $packagingItem)
    {
        return Inertia::render('PackagingItems/Edit', [
            'packagingItem' => $packagingItem,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PackagingItem $packagingItem)
    {
        $validatedData = $request->validate([
            'nama_item' => 'required|string|max:255|unique:packaging_items,nama_item,'.$packagingItem->id,
            'tipe_item' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'biaya_per_item' => 'required|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $packagingItem->update($validatedData);

        return Redirect::route('packaging-items.index')->with('success', 'Item kemasan berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PackagingItem $packagingItem)
    {
        // Di masa depan bisa ditambahkan validasi jika item sedang terpakai
        $packagingItem->delete();

        return Redirect::route('packaging-items.index')->with('success', 'Item kemasan berhasil dihapus.');
    }
}