// resources/js/Pages/Packaging/Create.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

export default function Create({ auth, roastedBeans, packagingItems, flash }) {
    // roastedBeans: Stok roasted bean curah yang tersedia
    // packagingItems: Stok item kemasan yang tersedia

    const { data, setData, post, processing, errors, reset } = useForm({
        roasted_bean_id: '',
        nama_produk: '',
        berat_bersih_g: '',
        kuantitas_kemasan: '',
        tanggal_kemas: new Date().toISOString().split('T')[0],
        catatan: '',
        bahan_kemasan: [], // Akan berisi array: [{id, nama_item, kuantitas, biaya_per_item}]
    });

    // State lokal untuk form penambahan bahan kemasan
    const [selectedPackagingId, setSelectedPackagingId] = useState('');
    const [packagingQty, setPackagingQty] = useState(1);

    // --- Logika untuk auto-fill dan kalkulasi ---
    const selectedRoastedBean = useMemo(() => 
        roastedBeans.find(rb => rb.id === parseInt(data.roasted_bean_id))
    , [data.roasted_bean_id, roastedBeans]);

    // Auto-fill nama produk saat roasted bean atau berat bersih berubah
    useEffect(() => {
        if (selectedRoastedBean) {
            const baseName = selectedRoastedBean.roast_batch?.green_bean?.nama_kopi || 'Kopi';
            const roastLevel = selectedRoastedBean.roast_level || '';
            const weight = data.berat_bersih_g ? `${data.berat_bersih_g}g` : '';
            setData('nama_produk', `${baseName} - ${roastLevel} - ${weight}`.replace(/ -  - /g, ' - ').trim());
        }
    }, [selectedRoastedBean, data.berat_bersih_g]);

    // Kalkulasi HPP Preview
    const hppPreview = useMemo(() => {
        if (!selectedRoastedBean || !data.berat_bersih_g) return { coffee: 0, packaging: 0, total: 0 };

        const rbData = selectedRoastedBean.roast_batch;
        const hppDasarPerGram = rbData.total_cost / rbData.berat_total_roasted_bean_dihasilkan_g;
        const coffeeCost = hppDasarPerGram * data.berat_bersih_g;

        const packagingCost = data.bahan_kemasan.reduce((sum, item) => {
            return sum + (item.biaya_per_item * item.kuantitas);
        }, 0);

        return {
            coffee: coffeeCost,
            packaging: packagingCost,
            total: coffeeCost + packagingCost,
        };
    }, [data.berat_bersih_g, data.bahan_kemasan, selectedRoastedBean]);

    // --- Fungsi untuk mengelola bahan kemasan ---
    const addPackagingItem = () => {
        if (!selectedPackagingId || packagingQty <= 0) return;

        // Cek apakah item sudah ada di daftar
        const itemExists = data.bahan_kemasan.some(item => item.id === parseInt(selectedPackagingId));
        if (itemExists) {
            alert('Item kemasan ini sudah ditambahkan.');
            return;
        }

        const itemToAdd = packagingItems.find(pi => pi.id === parseInt(selectedPackagingId));
        if (itemToAdd) {
            setData('bahan_kemasan', [
                ...data.bahan_kemasan,
                {
                    id: itemToAdd.id,
                    nama_item: itemToAdd.nama_item,
                    kuantitas: parseInt(packagingQty),
                    biaya_per_item: parseFloat(itemToAdd.biaya_per_item),
                }
            ]);
            // Reset input
            setSelectedPackagingId('');
            setPackagingQty(1);
        }
    };

    const removePackagingItem = (idToRemove) => {
        setData('bahan_kemasan', data.bahan_kemasan.filter(item => item.id !== idToRemove));
    };

    // --- Submit Form Utama ---
    const submit = (e) => {
        e.preventDefault();
        if (data.bahan_kemasan.length === 0) {
            alert('Harap tambahkan minimal satu bahan kemasan.');
            return;
        }
        post(route('packaging.store'), {
            onSuccess: () => reset(),
        });
    };

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(value);

    return (
        <AuthenticatedLayout auth={auth} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Proses Pengemasan Baru</h2>}>
            <Head title="Proses Pengemasan" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 space-y-6">

                            {flash.error && (<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{flash.error}</div>)}
                            {Object.keys(errors).length > 0 && (<div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">Ada kesalahan pada input Anda. Silakan periksa kembali.</div>)}

                            {/* Bagian 1: Produk Jadi */}
                            <div className="border-b dark:border-gray-700 pb-6">
                                <h3 className="text-lg font-medium">1. Detail Produk Jadi</h3>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="roasted_bean_id" value="Pilih Roasted Beans *" />
                                        <select id="roasted_bean_id" value={data.roasted_bean_id} onChange={e => setData('roasted_bean_id', e.target.value)} className="mt-1 block w-full ... rounded-md" required>
                                            <option value="">-- Pilih Kopi --</option>
                                            {roastedBeans.map(rb => <option key={rb.id} value={rb.id}>{rb.nama_produk_sangrai} (Stok: {rb.stok_tersisa_g}g)</option>)}
                                        </select>
                                        <InputError message={errors.roasted_bean_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="nama_produk" value="Nama Produk Jadi *" />
                                        <TextInput id="nama_produk" value={data.nama_produk} onChange={e => setData('nama_produk', e.target.value)} className="mt-1 block w-full" required placeholder="Akan terisi otomatis"/>
                                        <InputError message={errors.nama_produk} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="berat_bersih_g" value="Berat Bersih per Kemasan (g) *" />
                                        <TextInput id="berat_bersih_g" type="number" value={data.berat_bersih_g} onChange={e => setData('berat_bersih_g', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.berat_bersih_g} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="kuantitas_kemasan" value="Jumlah Kemasan Dibuat (pcs) *" />
                                        <TextInput id="kuantitas_kemasan" type="number" value={data.kuantitas_kemasan} onChange={e => setData('kuantitas_kemasan', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.kuantitas_kemasan} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="tanggal_kemas" value="Tanggal Kemas *" />
                                        <TextInput id="tanggal_kemas" type="date" value={data.tanggal_kemas} onChange={e => setData('tanggal_kemas', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.tanggal_kemas} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Bagian 2: Bahan Kemasan */}
                            <div className="border-b dark:border-gray-700 pb-6">
                                <h3 className="text-lg font-medium">2. Pilih Bahan Kemasan</h3>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Tambahkan semua item yang digunakan untuk membuat **satu** kemasan produk jadi.</div>
                                <div className="mt-4 flex items-end gap-4">
                                    <div className="flex-grow">
                                        <InputLabel htmlFor="packaging_item_select" value="Item Kemasan" />
                                        <select id="packaging_item_select" value={selectedPackagingId} onChange={e => setSelectedPackagingId(e.target.value)} className="mt-1 block w-full ... rounded-md">
                                            <option value="">-- Pilih Item --</option>
                                            {packagingItems.map(pi => <option key={pi.id} value={pi.id}>{pi.nama_item} (Stok: {pi.stok})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="packaging_qty" value="Jml (pcs)" />
                                        <TextInput id="packaging_qty" type="number" min="1" value={packagingQty} onChange={e => setPackagingQty(e.target.value)} className="mt-1 block w-20"/>
                                    </div>
                                    <PrimaryButton type="button" onClick={addPackagingItem}>Tambah</PrimaryButton>
                                </div>
                                <InputError message={errors.bahan_kemasan} className="mt-2" />

                                <div className="mt-4">
                                    <h4 className="font-medium text-sm">Bahan Kemasan Terpilih:</h4>
                                    {data.bahan_kemasan.length === 0 ? (
                                        <p className="text-sm text-gray-500 mt-2">Belum ada bahan yang ditambahkan.</p>
                                    ) : (
                                        <ul className="mt-2 divide-y dark:divide-gray-700 border dark:border-gray-700 rounded-md">
                                            {data.bahan_kemasan.map((item) => (
                                                <li key={item.id} className="p-2 flex justify-between items-center">
                                                    <span>{item.nama_item} <span className="text-gray-500">x{item.kuantitas}</span></span>
                                                    <button type="button" onClick={() => removePackagingItem(item.id)} className="text-red-500 hover:text-red-700 text-xs">HAPUS</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Bagian 3: Rincian HPP & Submit */}
                            <div>
                                <h3 className="text-lg font-medium">3. Kalkulasi HPP per Kemasan</h3>
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                                    <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Biaya Kopi</span><span>{formatCurrency(hppPreview.coffee)}</span></div>
                                    <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Biaya Kemasan</span><span>{formatCurrency(hppPreview.packaging)}</span></div>
                                    <div className="flex justify-between font-bold text-md border-t dark:border-gray-600 pt-2 mt-2"><span >Estimasi Total HPP / Kemasan</span><span>{formatCurrency(hppPreview.total)}</span></div>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="catatan" value="Catatan (Opsional)" />
                                <textarea id="catatan" value={data.catatan} onChange={e => setData('catatan', e.target.value)} className="mt-1 block w-full ... rounded-md" rows="3"></textarea>
                                <InputError message={errors.catatan} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Link href={route('dashboard')} className="underline text-sm ... mr-4">Batal</Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Memproses...' : 'Simpan Proses Pengemasan'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}