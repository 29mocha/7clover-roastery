// resources/js/Pages/PackagedProducts/Show.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Show({ auth, packagedProduct, profitMargin, suggestedSellingPrice }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Detail Produk Jadi: {packagedProduct.nama_produk}
                </h2>
            }
        >
            <Head title={`Detail Produk - ${packagedProduct.nama_produk}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <div className="space-y-6">

                                {/* Informasi Produk & Stok */}
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

                                {/* Rincian HPP */}
                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Rincian HPP per Kemasan</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Kopi</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(packagedProduct.biaya_kopi_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Kemasan</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(packagedProduct.biaya_kemasan_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total HPP per Kemasan</dt><dd className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(packagedProduct.total_hpp_per_kemasan)}</dd></div>
                                    </dl>
                                </div>

                                {/* Bahan Kemasan yang Digunakan */}
                                {packagedProduct.packaging_items && packagedProduct.packaging_items.length > 0 && (
                                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">Bahan Kemasan Digunakan</h3>
                                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                            {packagedProduct.packaging_items.map(item => (
                                                <li key={item.id}>
                                                    {item.nama_item} (x{item.pivot.kuantitas_digunakan})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Informasi Asal */}
                                <div className="pb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Traceability</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Asal Roast Batch</dt><dd className="mt-1 text-sm"><Link href={route('roast-batches.show', packagedProduct.roasted_bean.roast_batch.id)} className="text-indigo-600 hover:underline">{packagedProduct.roasted_bean.roast_batch.nomor_batch_roasting}</Link></dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Asal Green Bean</dt><dd className="mt-1 text-sm"><Link href={route('green-beans.show', packagedProduct.roasted_bean.roast_batch.green_bean.id)} className="text-indigo-600 hover:underline">{packagedProduct.roasted_bean.roast_batch.green_bean.nama_kopi}</Link></dd></div>
                                    </dl>
                                </div>
{/* Rincian HPP - DITAMBAHKAN BAGIAN BARU */}
                                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Rincian Harga per Kemasan</h3>
                                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Kopi</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(packagedProduct.biaya_kopi_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Biaya Kemasan</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(packagedProduct.biaya_kemasan_per_kemasan)}</dd></div>
                                        <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total HPP per Kemasan</dt><dd className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(packagedProduct.total_hpp_per_kemasan)}</dd></div>

                                        {/* ==== BAGIAN SARAN HARGA JUAL BARU ==== */}
                                        <div className="sm:col-span-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Saran Harga Jual (Margin {profitMargin}%)</dt>
                                            <dd className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(suggestedSellingPrice)}</dd>
                                        </div>
                                        {/* ==================================== */}
                                    </dl>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Link href={route('packaged-products.index')}><SecondaryButton>Kembali ke Daftar</SecondaryButton></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}