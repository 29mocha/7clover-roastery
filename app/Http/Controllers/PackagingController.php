<?php

namespace App\Http\Controllers;

use App\Models\PackagingItem;
use App\Models\RoastedBean;
use App\Models\PackagedProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PackagingController extends Controller
{
    /**
     * Menampilkan form untuk proses pengemasan.
     */
    public function create()
    {
        // Ambil data yang dibutuhkan untuk dropdown di form
        $roastedBeans = RoastedBean::where('stok_tersisa_g', '>', 0)
            ->with('roastBatch.greenBean') // Untuk menampilkan info asal kopi
            ->get();

        $packagingItems = PackagingItem::where('stok', '>', 0)->get();

        return Inertia::render('Packaging/Create', [
            'roastedBeans' => $roastedBeans,
            'packagingItems' => $packagingItems,
        ]);
    }

    /**
     * Menyimpan hasil proses pengemasan.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'roasted_bean_id' => 'required|exists:roasted_beans,id',
            'nama_produk' => 'required|string|max:255',
            'berat_bersih_g' => 'required|integer|min:1',
            'kuantitas_kemasan' => 'required|integer|min:1',
            'tanggal_kemas' => 'required|date_format:Y-m-d',
            'catatan' => 'nullable|string',
            'bahan_kemasan' => 'required|array|min:1',
            'bahan_kemasan.*.id' => 'required|exists:packaging_items,id',
            'bahan_kemasan.*.kuantitas' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $roastedBean = RoastedBean::findOrFail($validatedData['roasted_bean_id']);
            $roastBatch = $roastedBean->roastBatch;

            // 1. Validasi Stok Kopi
            $totalCoffeeNeeded = $validatedData['berat_bersih_g'] * $validatedData['kuantitas_kemasan'];
            if ($roastedBean->stok_tersisa_g < $totalCoffeeNeeded) {
                throw ValidationException::withMessages(['roasted_bean_id' => 'Stok roasted bean curah tidak mencukupi.']);
            }

            // 2. Kalkulasi Biaya
            $hppDasarPerGram = $roastBatch->total_cost / $roastBatch->berat_total_roasted_bean_dihasilkan_g;
            $biayaKopiPerKemasan = $hppDasarPerGram * $validatedData['berat_bersih_g'];
            
            $biayaKemasanPerKemasan = 0;
            $packagingItemsToSync = [];

            foreach ($validatedData['bahan_kemasan'] as $item) {
                $packagingItem = PackagingItem::findOrFail($item['id']);
                $totalPackagingNeeded = $item['kuantitas'] * $validatedData['kuantitas_kemasan'];
                
                // Validasi Stok Kemasan
                if ($packagingItem->stok < $totalPackagingNeeded) {
                    throw ValidationException::withMessages(['bahan_kemasan' => 'Stok untuk item kemasan "' . $packagingItem->nama_item . '" tidak mencukupi.']);
                }

                $biayaKemasanPerKemasan += $packagingItem->biaya_per_item * $item['kuantitas'];
                
                // Kurangi stok kemasan
                $packagingItem->stok -= $totalPackagingNeeded;
                $packagingItem->save();

                // Siapkan data untuk tabel pivot
                $packagingItemsToSync[$item['id']] = ['kuantitas_digunakan' => $item['kuantitas']];
            }

            $totalHppPerKemasan = $biayaKopiPerKemasan + $biayaKemasanPerKemasan;

            // 3. Kurangi Stok Roasted Bean Curah
            $roastedBean->stok_tersisa_g -= $totalCoffeeNeeded;
            $roastedBean->save();

            // 4. Buat record Produk Jadi (Packaged Product)
            $packagedProduct = PackagedProduct::create([
                'roasted_bean_id' => $roastedBean->id,
                'nama_produk' => $validatedData['nama_produk'],
                'berat_bersih_g' => $validatedData['berat_bersih_g'],
                'kuantitas_awal' => $validatedData['kuantitas_kemasan'],
                'kuantitas_tersisa' => $validatedData['kuantitas_kemasan'],
                'biaya_kopi_per_kemasan' => $biayaKopiPerKemasan,
                'biaya_kemasan_per_kemasan' => $biayaKemasanPerKemasan,
                'total_hpp_per_kemasan' => $totalHppPerKemasan,
                'tanggal_kemas' => $validatedData['tanggal_kemas'],
                'catatan' => $validatedData['catatan'],
            ]);
            
            // 5. Sinkronkan ke tabel pivot
            $packagedProduct->packagingItems()->sync($packagingItemsToSync);

            DB::commit();

            // Diarahkan ke halaman daftar Roasted Beans, atau nanti kita buat halaman daftar Packaged Products
            return Redirect::route('roasted-beans.index')->with('success', 'Produk berhasil dikemas dan HPP final dihitung.');

        } catch (ValidationException $e) {
            DB::rollBack();
            return Redirect::back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error during packaging process: ' . $e->getMessage(), ['request' => $request->all()]);
            return Redirect::back()->withInput()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}