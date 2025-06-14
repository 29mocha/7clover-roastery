import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton'; // <-- Import SecondaryButton
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function GreenBeanUsage({ auth, reportData, summary, filters }) {
    // reportData: Array dari green bean yang digunakan
    // summary: Objek berisi grand total { gram_used, total_cost }
    // filters: Objek berisi tanggal yang aktif { date_from, date_to }

    // Gunakan useForm untuk mengelola filter tanggal
    const { data, setData, get, processing } = useForm({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        // Kirim request GET ke route yang sama dengan parameter filter baru
        get(route('reports.green-bean-usage'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Helper untuk format mata uang
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(value);
    };
    
    // Helper untuk format gram ke kg
    const formatGramToKg = (grams) => {
        if (grams === null || grams === undefined) return 'N/A';
        return (parseFloat(grams) / 1000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl ...">Laporan Penggunaan Green Bean</h2>}
        >
            <Head title="Laporan Penggunaan Green Bean" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Bagian Filter */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            {/* ==== PERBAIKAN STRUKTUR FORM DI SINI ==== */}
                            <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div>
                                        <InputLabel htmlFor="date_from" value="Dari Tanggal" />
                                        <TextInput id="date_from" type="date" name="date_from" value={data.date_from} className="mt-1 block w-full" onChange={(e) => setData('date_from', e.target.value)} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="date_to" value="Sampai Tanggal" />
                                        <TextInput id="date_to" type="date" name="date_to" value={data.date_to} className="mt-1 block w-full" onChange={(e) => setData('date_to', e.target.value)} />
                                    </div>
                                    <div>
                                        <PrimaryButton className="h-10 w-full sm:w-auto" disabled={processing}>
                                            {processing ? 'Memuat...' : 'Terapkan'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                                <div className="self-end">
                                    <a href={route('reports.green-bean-usage.export', { date_from: data.date_from, date_to: data.date_to })} className="w-full sm:w-auto">
                                        <SecondaryButton className="h-10 w-full">
                                            Export ke Excel
                                        </SecondaryButton>
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Bagian Ringkasan */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-2">Ringkasan Periode ({filters.date_from} s/d {filters.date_to})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Green Bean Digunakan</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {summary.gram_used.toLocaleString('id-ID')} <span className="text-lg">gram</span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">({formatGramToKg(summary.gram_used)} kg)</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Estimasi Nilai Bahan Baku</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(summary.total_cost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Rincian */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100 space-y-6">
                            <h3 className="text-lg font-semibold">Rincian Penggunaan</h3>
                            {reportData && reportData.length > 0 ? (
                                reportData.map(item => (
                                    <div key={item.green_bean_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-md text-gray-800 dark:text-gray-200">{item.nama_kopi}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Lot: {item.lot_identifier}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Digunakan</p>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.total_g_used.toLocaleString('id-ID')} g</p>
                                                <p className="font-semibold text-green-600 dark:text-green-500">{formatCurrency(item.total_cost)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-medium">No. Batch</th>
                                                        <th className="px-3 py-2 text-left font-medium">Tanggal</th>
                                                        <th className="px-3 py-2 text-right font-medium">Jumlah (g)</th>
                                                        <th className="px-3 py-2 text-right font-medium">Nilai Bahan Baku</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                    {item.batches.map(batch => (
                                                        <tr key={batch.id}>
                                                            <td className="px-3 py-2">{batch.nomor_batch_roasting}</td>
                                                            <td className="px-3 py-2">{batch.tanggal_roasting}</td>
                                                            <td className="px-3 py-2 text-right">{batch.berat_green_bean_digunakan_g.toLocaleString('id-ID')}</td>
                                                            <td className="px-3 py-2 text-right">{formatCurrency(batch.cost)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">Tidak ada penggunaan green bean pada periode yang dipilih.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}