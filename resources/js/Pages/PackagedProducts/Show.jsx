import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState, useEffect } from 'react';

export default function Show({ auth, packagedProduct, flash, profitMargin, suggestedSellingPrice }) {
    const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);

    // Form hook untuk modal penyesuaian stok
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        adjustment_quantity: '',
        adjustment_type: 'decrease',
        reason: '',
        adjustment_date: new Date().toISOString().slice(0, 16),
    });

    const openAdjustStockModal = () => {
        reset();
        setData('adjustment_date', new Date().toISOString().slice(0, 16));
        setIsAdjustStockModalOpen(true);
    };

    const closeAdjustStockModal = () => setIsAdjustStockModalOpen(false);

    const handleAdjustmentSubmit = (e) => {
        e.preventDefault();
        post(route('packaged-products.adjust-stock', packagedProduct.id), {
            preserveScroll: true,
            onSuccess: () => closeAdjustStockModal(),
        });
    };
    
    // Secara otomatis menutup modal jika form berhasil disubmit
    useEffect(() => {
        if (recentlySuccessful && isAdjustStockModalOpen) {
            closeAdjustStockModal();
        }
    }, [recentlySuccessful, isAdjustStockModalOpen]);

    const adjustmentTypes = [
        { value: 'decrease', label: 'Pengurangan (Penjualan/Sampel)' },
        { value: 'increase', label: 'Penambahan (Pengembalian/Lainnya)' },
        { value: 'correction', label: 'Koreksi (Setel Stok ke Nilai Baru)' },
    ];
    
    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };
    
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Produk Jadi: {packagedProduct.nama_produk}</h2>}
        >
            <Head title={`Detail Produk - ${packagedProduct.nama_produk}`} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {flash && flash.success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{flash.success}</div>)}
                    {flash && flash.error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{flash.error}</div>)}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <div className="space-y-6">

                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Informasi Produk & Stok</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Produk</dt><dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{packagedProduct.nama_produk}</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Kemas</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(packagedProduct.tanggal_kemas)}</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Berat Bersih per Kemasan</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{packagedProduct.berat_bersih_g} gram</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kuantitas Awal</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{packagedProduct.kuantitas_awal} pcs</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kuantitas Tersisa</dt><dd className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">{packagedProduct.kuantitas_tersisa} pcs</dd></div>
                                    </dl>
                                </div>

                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Rincian Harga per Kemasan</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Kopi</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(packagedProduct.biaya_kopi_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Kemasan</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(packagedProduct.biaya_kemasan_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total HPP per Kemasan</dt><dd className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(packagedProduct.total_hpp_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Saran Harga Jual (Margin {profitMargin}%)</dt>
                                            <dd className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(suggestedSellingPrice)}</dd>
                                        </div>
                                    </dl>
                                </div>
                                
                                {packagedProduct.packaging_items && packagedProduct.packaging_items.length > 0 && (
                                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">Bahan Kemasan Digunakan</h3>
                                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                            {packagedProduct.packaging_items.map(item => ( <li key={item.id}>{item.nama_item} (x{item.pivot.kuantitas_digunakan})</li> ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Traceability</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Asal Roast Batch</dt><dd className="mt-1 text-sm"><Link href={route('roast-batches.show', packagedProduct.roasted_bean.roast_batch.id)} className="text-indigo-600 hover:underline">{packagedProduct.roasted_bean.roast_batch.nomor_batch_roasting}</Link></dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Asal Green Bean</dt><dd className="mt-1 text-sm"><Link href={route('green-beans.show', packagedProduct.roasted_bean.roast_batch.green_bean.id)} className="text-indigo-600 hover:underline">{packagedProduct.roasted_bean.roast_batch.green_bean.nama_kopi}</Link></dd></div>
                                    </dl>
                                </div>
                                
                                {packagedProduct.stock_adjustments && packagedProduct.stock_adjustments.length > 0 && (
                                    <div className="pt-4">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Riwayat Penyesuaian Stok</h3>
                                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium ...">Tanggal</th><th className="px-4 py-3 text-left text-xs ...">Tipe</th><th className="px-4 py-3 text-right text-xs ...">Jumlah (pcs)</th><th className="px-4 py-3 text-right text-xs ...">Stok Sebelum</th><th className="px-4 py-3 text-right text-xs ...">Stok Sesudah</th><th className="px-4 py-3 text-left text-xs ...">Alasan</th><th className="px-4 py-3 text-left text-xs ...">Oleh</th>
                                            </tr></thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{packagedProduct.stock_adjustments.map((adj) => (
                                                <tr key={adj.id}><td className="px-4 py-4 ...">{formatDate(adj.adjustment_date, true)}</td><td className="px-4 py-4 ...">{adj.adjustment_type}</td><td className={`px-4 py-4 ... text-right font-medium ${parseFloat(adj.quantity_adjusted_g) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{parseFloat(adj.quantity_adjusted_g) >= 0 ? '+' : ''}{adj.quantity_adjusted_g}</td><td className="px-4 py-4 ... text-right">{adj.stock_before_adjustment_g}</td><td className="px-4 py-4 ... text-right">{adj.stock_after_adjustment_g}</td><td className="px-4 py-4 ... max-w-xs truncate" title={adj.reason}>{adj.reason || '-'}</td><td className="px-4 py-4 ...">{adj.user ? adj.user.name : 'Sistem'}</td></tr>
                                            ))}</tbody>
                                        </table></div>
                                    </div>
                                )}

                                <div className="mt-6 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    {auth.can.manage_app && (<PrimaryButton onClick={openAdjustStockModal}>Sesuaikan Stok</PrimaryButton>)}
                                    <Link href={route('packaged-products.index')}><SecondaryButton>Kembali ke Daftar</SecondaryButton></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isAdjustStockModalOpen} onClose={closeAdjustStockModal} maxWidth="lg">
                <form onSubmit={handleAdjustmentSubmit} className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sesuaikan Stok untuk: {packagedProduct.nama_produk}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Stok saat ini: {packagedProduct.kuantitas_tersisa} pcs.</p>
                    <div className="mt-6"><InputLabel htmlFor="adjustment_type" value="Jenis Penyesuaian *" /><select id="adjustment_type" value={data.adjustment_type} onChange={(e) => setData('adjustment_type', e.target.value)} className="mt-1 block w-full ... rounded-md" required>{adjustmentTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}</select><InputError message={errors.adjustment_type} className="mt-2" /></div>
                    <div className="mt-4"><InputLabel htmlFor="adjustment_quantity">{data.adjustment_type === 'correction' ? 'Setel Stok Menjadi (pcs) *' : 'Jumlah Penyesuaian (pcs) *'}</InputLabel><TextInput id="adjustment_quantity" type="number" name="adjustment_quantity" value={data.adjustment_quantity} className="mt-1 block w-full" step="1" min={data.adjustment_type === 'correction' ? "0" : "1"} onChange={(e) => setData('adjustment_quantity', e.target.value)} required isFocused /><InputError message={errors.adjustment_quantity} className="mt-2" /></div>
                    <div className="mt-4"><InputLabel htmlFor="reason" value="Alasan / Catatan" /><textarea id="reason" name="reason" value={data.reason} className="mt-1 block w-full ... rounded-md" rows="3" onChange={(e) => setData('reason', e.target.value)}></textarea><InputError message={errors.reason} className="mt-2" /></div>
                    <div className="mt-6 flex justify-end"><SecondaryButton type="button" onClick={closeAdjustStockModal}>Batal</SecondaryButton><PrimaryButton className="ms-3" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</PrimaryButton></div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}