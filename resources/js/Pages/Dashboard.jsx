import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({
    auth,
    totalGreenBeanStockG,
    totalGreenBeanValue,
    lowStockGreenBeans,
    totalRoastedBeanStockGram,
    recentRoastedBeansWithStock,
    recentRoastBatches,
    groupedStockByOrigin, // <-- Terima prop baru
    totalPackagedProductQty,     // <-- Terima prop baru
    totalPackagedProductValue,   // <-- Terima prop baru
    recentPackagedProducts,      // <-- Terima prop baru
    profitMargin, totalPackagedProductRevenuePotential // <-- Terima props baru
}) {

    // Helper untuk format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    // Helper untuk format gram ke kg untuk tampilan
    const formatGramToKg = (grams) => {
        if (grams === null || grams === undefined) return 'N/A';
        return (parseFloat(grams) / 1000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    };

    // Helper baru untuk format mata uang
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard Inventaris Kopi</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Kartu Ringkasan Green Beans */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Stok Green Beans</h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatGramToKg(totalGreenBeanStockG)}
                                <span className="text-xl"> kg</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ({totalGreenBeanStockG.toLocaleString('id-ID')} gram)
                            </p>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Estimasi Nilai Stok:</p>
                                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    {formatCurrency(totalGreenBeanValue)}
                                </p>
                            </div>

                            {lowStockGreenBeans && lowStockGreenBeans.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-md font-medium text-yellow-600 dark:text-yellow-400 mb-2">Stok Menipis (≤ 5kg):</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {lowStockGreenBeans.map(bean => (
                                            <li key={bean.id} className="text-gray-700 dark:text-gray-300">
                                                <Link href={route('green-beans.show', bean.id)} className="hover:underline text-blue-600 dark:text-blue-400">
                                                    {bean.nama_kopi} ({bean.lot_identifier})
                                                </Link>
                                                : {formatGramToKg(bean.stok_saat_ini_g)} kg
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-6">
                                <Link href={route('green-beans.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Lihat Semua Green Beans &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Kartu Ringkasan Roasted Beans */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Stok Roasted Beans</h3>
                            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                                {totalRoastedBeanStockGram.toLocaleString('id-ID')}
                                <span className="text-xl"> gram</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total semua roasted bean siap pakai</p>
                            
                            {recentRoastedBeansWithStock && recentRoastedBeansWithStock.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Stok Roasted Terbaru:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {recentRoastedBeansWithStock.map(rb => (
                                            <li key={rb.id} className="text-gray-700 dark:text-gray-300">
                                                <Link href={route('roasted-beans.show', rb.id)} className="hover:underline text-blue-600 dark:text-blue-400">
                                                    {rb.nama_produk_sangrai}
                                                </Link>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Tgl Roast: {formatDate(rb.tanggal_roasting)}</span>
                                                    <span className="font-semibold">{rb.stok_tersisa_g} g</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-6">
                                <Link href={route('roasted-beans.index')} className="text-sm text-teal-600 dark:text-teal-400 hover:underline">
                                    Lihat Semua Roasted Beans &rarr;
                                </Link>
                            </div>
                        </div>
                        {/* ==== KARTU STOK PER ORIGIN YANG DIPERBARUI ==== */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Stok per Origin</h3>
                            {groupedStockByOrigin && Object.keys(groupedStockByOrigin).length > 0 ? (
                                <div className="space-y-4 mt-4">
                                    {/* Lakukan iterasi pada setiap origin */}
                                    {Object.entries(groupedStockByOrigin).map(([origin, beansInOrigin]) => {
                                        // Hitung total stok untuk origin ini di sisi frontend
                                        const totalStokG = beansInOrigin.reduce((sum, bean) => sum + parseFloat(bean.stok_saat_ini_g), 0);

                                        return (
                                            <div key={origin} className="text-sm">
                                                {/* Tampilkan Total per Origin */}
                                                <div className="flex justify-between items-baseline border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
                                                    <span className="font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{origin}</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatGramToKg(totalStokG)} kg</span>
                                                </div>
                                                {/* Tampilkan Rincian per Kopi di dalam Origin */}
                                                <ul className="pl-4 list-disc list-inside">
                                                    {beansInOrigin.map(bean => (
                                                        <li key={bean.id} className="flex justify-between items-baseline text-xs">
                                                            <span className="text-gray-600 dark:text-gray-400 truncate pr-2">{bean.nama_kopi}</span>
                                                            <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{bean.stok_saat_ini_g.toLocaleString('id-ID')} g</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Tidak ada data stok berdasarkan origin.</p>
                            )}
                        </div>

                        {/* Kartu Aktivitas Roasting Terkini */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 md:col-span-2 lg:col-span-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Aktivitas Roasting Terkini</h3>
                            {recentRoastBatches && recentRoastBatches.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentRoastBatches.map(batch => (
                                        <li key={batch.id} className="text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0">
                                            <Link href={route('roast-batches.show', batch.id)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                {batch.nomor_batch_roasting}
                                            </Link>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {batch.green_bean?.nama_kopi || 'N/A'} - {batch.roast_level}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {formatDate(batch.tanggal_roasting)} - Hasil: {batch.berat_total_roasted_bean_dihasilkan_g}g
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada aktivitas roasting.</p>
                            )}
                            <div className="mt-6">
                                <Link href={route('roast-batches.index')} className="text-sm text-green-600 dark:text-green-400 hover:underline">
                                    Lihat Semua Roast Batches &rarr;
                                </Link>
                            </div>
                        </div>
{/* ==== KARTU STOK PRODUK JADI YANG DIPERBARUI ==== */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Stok Produk Jadi (Kemasan)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b dark:border-gray-700 pb-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Kuantitas</p>
                                    <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                                        {totalPackagedProductQty.toLocaleString('id-ID')}
                                        <span className="text-xl"> pcs</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimasi Nilai Stok (Modal/HPP)</p>
                                    <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        {formatCurrency(totalPackagedProductValue)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Tampilan Potensi Pendapatan Baru */}
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Potensi Pendapatan (Nilai Jual dengan Margin {profitMargin}%)</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(totalPackagedProductRevenuePotential)}
                                </p>
                            </div>
                            
                            {recentPackagedProducts && recentPackagedProducts.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Produk Jadi Terbaru:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {recentPackagedProducts.map(prod => (
                                            <li key={prod.id} className="text-gray-700 dark:text-gray-300">
                                                <Link href={route('packaged-products.show', prod.id)} className="hover:underline text-blue-600 dark:text-blue-400">
                                                    {prod.nama_produk}
                                                </Link>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Tgl Kemas: {formatDate(prod.tanggal_kemas)}</span>
                                                    <span className="font-semibold">{prod.kuantitas_tersisa} pcs</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-6">
                                <Link href={route('packaged-products.index')} className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                    Lihat Semua Produk Jadi &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}