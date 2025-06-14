// resources/js/Pages/RoastedBeans/Show.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState, useEffect } from 'react';

export default function Show({ auth, roastedBean, flash }) {
    const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
    const { errors: pageErrors } = usePage().props;

    // Form hook untuk modal penyesuaian stok
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        adjustment_quantity_g: '',
        adjustment_type: 'decrease',
        reason: '',
        adjustment_date: new Date().toISOString().slice(0, 16),
    });

    // Helper untuk format tanggal
    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const openAdjustStockModal = () => {
        reset();
        setData('adjustment_date', new Date().toISOString().slice(0, 16));
        setIsAdjustStockModalOpen(true);
    };

    const closeAdjustStockModal = () => {
        setIsAdjustStockModalOpen(false);
    };

    const handleAdjustmentSubmit = (e) => {
        e.preventDefault();
        post(route('roasted-beans.adjust-stock', roastedBean.id), {
            preserveScroll: true,
            onSuccess: () => {}, // Ditutup oleh useEffect
        });
    };

    useEffect(() => {
        if (recentlySuccessful && isAdjustStockModalOpen) {
            closeAdjustStockModal();
        }
    }, [recentlySuccessful, isAdjustStockModalOpen]);

    
const adjustmentTypes = [
    { value: 'correction', label: 'Koreksi (Setel Stok ke Nilai Baru)' },
    { value: 'increase', label: 'Penambahan Stok' },
    { value: 'decrease', label: 'Pengurangan Stok (Sampel/Rusak/dll)' },
];

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Detail Roasted Bean: {roastedBean.nama_produk_sangrai}
                </h2>
            }
        >
            <Head title={`Detail ${roastedBean.nama_produk_sangrai}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Message Display */}
                    {flash && flash.success && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">
                            {flash.success}
                        </div>
                    )}
                    {flash && flash.error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <div className="space-y-6">

                                {/* Informasi Produk Roasted Bean */}
                                <div className="pb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Informasi Produk</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Produk Sangrai</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastedBean.nama_produk_sangrai}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Roasting</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(roastedBean.tanggal_roasting)}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Roast Level</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastedBean.roast_level}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Awal (dari batch)</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastedBean.stok_awal_g} gram</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Tersisa Saat Ini</dt>
                                            <dd className="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400">{roastedBean.stok_tersisa_g} gram</dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Catatan Item</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{roastedBean.catatan_item || 'Tidak ada catatan.'}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Informasi Roast Batch Asal */}
                                {roastedBean.roast_batch && (
                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Detail Roast Batch Asal</h3>
                                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nomor Batch Roasting</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                    <Link href={route('roast-batches.show', roastedBean.roast_batch.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                                                        {roastedBean.roast_batch.nomor_batch_roasting}
                                                    </Link>
                                                </dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Green Bean Digunakan</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastedBean.roast_batch.green_bean?.nama_kopi || 'N/A'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}
{/* ==== BAGIAN BARU: RIWAYAT PENGEMASAN ==== */}
                                {roastedBean.packaged_products && roastedBean.packaged_products.length > 0 && (
                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                                            Riwayat Penggunaan untuk Pengemasan
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tgl Kemas</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produk Jadi</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah Kopi Digunakan (g)</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jml Kemasan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {roastedBean.packaged_products.map((pkg) => {
                                                        const totalCoffeeUsed = pkg.berat_bersih_g * pkg.kuantitas_awal;
                                                        return (
                                                            <tr key={pkg.id}>
                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(pkg.tanggal_kemas)}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{pkg.nama_produk}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right font-medium">-{totalCoffeeUsed.toLocaleString('id-ID')}</td>
                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{pkg.kuantitas_awal} pcs</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {/* Riwayat Penyesuaian Stok */}
                                {roastedBean.stock_adjustments && roastedBean.stock_adjustments.length > 0 && (
                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                                            Riwayat Penyesuaian Stok
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipe</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah (g)</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok Sebelum (g)</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok Sesudah (g)</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Alasan</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Oleh</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {roastedBean.stock_adjustments.map((adj) => (
                                                        <tr key={adj.id}>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(adj.adjustment_date, true)}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{adj.adjustment_type}</td>
                                                            <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${parseFloat(adj.quantity_adjusted_g) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {parseFloat(adj.quantity_adjusted_g) >= 0 ? '+' : ''}{adj.quantity_adjusted_g}g
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{adj.stock_before_adjustment_g}g</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{adj.stock_after_adjustment_g}g</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={adj.reason}>{adj.reason || '-'}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{adj.user ? adj.user.name : 'Sistem/Tidak Diketahui'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Tombol Aksi */}
                                <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <SecondaryButton onClick={openAdjustStockModal}>
                                        Sesuaikan Stok
                                    </SecondaryButton>
                                    <Link href={route('roasted-beans.index')}>
                                        <SecondaryButton>Kembali ke Daftar</SecondaryButton>
                                    </Link>
                                    <Link href={route('roasted-beans.edit', roastedBean.id)}>
                                        <PrimaryButton>Edit Catatan/Stok</PrimaryButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal untuk Penyesuaian Stok */}
                <Modal show={isAdjustStockModalOpen} onClose={closeAdjustStockModal} maxWidth="lg">
                    <form onSubmit={handleAdjustmentSubmit} className="p-6 dark:bg-gray-800">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Sesuaikan Stok untuk: {roastedBean.nama_produk_sangrai}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Stok saat ini: {roastedBean.stok_tersisa_g} gram. Stok awal batch: {roastedBean.stok_awal_g} gram.
                        </p>

                        <div className="mt-6">
                            <InputLabel htmlFor="adjustment_type_rb" value="Jenis Penyesuaian *" />
                            <select
                                id="adjustment_type_rb"
                                name="adjustment_type"
                                value={data.adjustment_type}
                                onChange={(e) => setData('adjustment_type', e.target.value)}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                required
                            >
                                {adjustmentTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.adjustment_type} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="adjustment_quantity_g_rb">
                                {data.adjustment_type === 'correction' ? 'Set Stok Menjadi (gram) *' : 'Jumlah Penyesuaian (gram) *'}
                            </InputLabel>
                            <TextInput
                                id="adjustment_quantity_g_rb"
                                type="number" name="adjustment_quantity_g" value={data.adjustment_quantity_g}
                                className="mt-1 block w-full" step="0.1"
                                min={data.adjustment_type === 'correction' ? "0" : "0.1"}
                                onChange={(e) => setData('adjustment_quantity_g', e.target.value)}
                                required isFocused
                            />
                            <InputError message={errors.adjustment_quantity_g} className="mt-2" />
                            {data.adjustment_type !== 'correction' &&
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Masukkan angka positif. Tipe '{data.adjustment_type}' akan otomatis {data.adjustment_type === 'increase' ? 'menambah' : 'mengurangi'} stok.
                                </p>
                            }
                             {data.adjustment_type === 'correction' &&
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Nilai tidak boleh melebihi stok awal batch ({roastedBean.stok_awal_g}g).
                                </p>
                            }
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="adjustment_date_rb" value="Tanggal Penyesuaian (Opsional)" />
                            <TextInput
                                id="adjustment_date_rb"
                                type="datetime-local" name="adjustment_date" value={data.adjustment_date}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('adjustment_date', e.target.value)}
                            />
                            <InputError message={errors.adjustment_date} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="reason_rb" value={`Alasan ${data.adjustment_type === 'correction' || data.adjustment_type === 'spoilage' || data.adjustment_type === 'sample_use' ? '*' : '(Opsional)'}`} />
                            <textarea
                                id="reason_rb"
                                name="reason" value={data.reason}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                rows="3"
                                onChange={(e) => setData('reason', e.target.value)}
                                required={data.adjustment_type === 'correction' || data.adjustment_type === 'spoilage' || data.adjustment_type === 'sample_use'}
                            ></textarea>
                            <InputError message={errors.reason} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton type="button" onClick={closeAdjustStockModal}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton className="ms-3" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                            </PrimaryButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}