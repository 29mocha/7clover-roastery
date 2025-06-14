// resources/js/Pages/RoastBatches/Show.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Show({ auth, roastBatch }) {
    // roastBatch sekarang berisi green_bean_cost, operational_cost, dan total_cost

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (dateString.includes('T')) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Helper untuk format mata uang
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 2
        }).format(value);
    };

    // Kalkulasi HPP per gram dan per kg
    const hppPerGram = roastBatch.berat_total_roasted_bean_dihasilkan_g > 0
        ? roastBatch.total_cost / roastBatch.berat_total_roasted_bean_dihasilkan_g
        : 0;
    
    const hppPerKg = hppPerGram * 1000;

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Detail Roast Batch: {roastBatch.nomor_batch_roasting}
                </h2>
            }
        >
            <Head title={`Detail Batch ${roastBatch.nomor_batch_roasting}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <div className="space-y-6">
                                {/* Informasi Umum Batch */}
                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Informasi Umum</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nomor Batch</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.nomor_batch_roasting}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Roasting</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(roastBatch.tanggal_roasting)}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operator</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.nama_operator}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mesin Roasting</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.mesin_roasting || 'N/A'}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Informasi Green Bean yang Digunakan */}
                                {roastBatch.green_bean && (
                                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Green Bean Digunakan</h3>
                                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Kopi</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.green_bean.nama_kopi}</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Lot Identifier</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.green_bean.lot_identifier}</dd>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Berat Green Bean Digunakan</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.berat_green_bean_digunakan_g.toLocaleString('id-ID')} gram</dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}

                                {/* Hasil dan Parameter Roasting */}
                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Hasil & Parameter Roasting</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Berat Roasted Bean Dihasilkan</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.berat_total_roasted_bean_dihasilkan_g.toLocaleString('id-ID')} gram</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight Loss</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{parseFloat(roastBatch.weight_loss_percentage).toFixed(2)}%</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Roast Level</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.roast_level}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Waktu Roasting Total</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.waktu_roasting_total_menit ? `${roastBatch.waktu_roasting_total_menit} menit` : 'N/A'}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Suhu Akhir</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.suhu_akhir_celsius ? `${roastBatch.suhu_akhir_celsius}°C` : 'N/A'}</dd>
                                        </div>
                                         <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Catatan Roasting</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{roastBatch.catatan_roasting || 'Tidak ada catatan.'}</dd>
                                        </div>
                                    </dl>
                                </div>
 {/* ==== BAGIAN BARU: Rincian Biaya & HPP ==== */}
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Rincian Biaya & HPP</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Green Bean</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(roastBatch.green_bean_cost)}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Operasional</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(roastBatch.operational_cost)}</dd>
                                        </div>
                                        <div className="sm:col-span-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total HPP untuk Batch Ini</dt>
                                            <dd className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(roastBatch.total_cost)}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">HPP per Gram</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(hppPerGram)}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">HPP per KG</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(hppPerKg)}</dd>
                                        </div>
                                    </dl>
                                </div>
                                {/* ========================================== */}
                                {/* Informasi Produk Roasted Bean yang Dihasilkan */}
                                {roastBatch.roasted_bean && (
                                    <div className="pb-4">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Produk Roasted Bean (Inventaris)</h3>
                                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Produk Sangrai</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                    <Link href={route('roasted-beans.show', roastBatch.roasted_bean.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                                                        {roastBatch.roasted_bean.nama_produk_sangrai}
                                                    </Link>
                                                </dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Awal (dari batch ini)</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.roasted_bean.stok_awal_g.toLocaleString('id-ID')} gram</dd>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Tersisa Saat Ini</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{roastBatch.roasted_bean.stok_tersisa_g.toLocaleString('id-ID')} gram</dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}

                                {/* Tombol Aksi */}
                                <div className="mt-6 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Link href={route('roast-batches.index')}>
                                        <SecondaryButton>Kembali ke Daftar</SecondaryButton>
                                    </Link>
                                    <Link href={route('roast-batches.edit', roastBatch.id)}>
                                        <PrimaryButton>Edit Batch Ini</PrimaryButton>
                                    </Link>
                                    {/* ==== TOMBOL BARU UNTUK CETAK LABEL ==== */}
                                    <a href={route('roast-batches.label-pdf', roastBatch.id)} target="_blank" rel="noopener noreferrer">
                                        <SecondaryButton className="!bg-cyan-600 hover:!bg-cyan-700 !text-white focus:!ring-cyan-500">
                                            Cetak Label
                                        </SecondaryButton>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}