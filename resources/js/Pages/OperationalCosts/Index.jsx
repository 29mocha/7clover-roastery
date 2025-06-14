// resources/js/Pages/OperationalCosts/Index.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, operationalCosts, flash }) {
    // operationalCosts adalah array of objects yang dikirim dari controller

    // Helper untuk format mata uang
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengaturan Biaya Operasional</h2>}
        >
            <Head title="Biaya Operasional" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            {flash.success && (
                                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                    {flash.success}
                                </div>
                            )}

                            <div className="mb-6 flex justify-end">
                                <Link href={route('operational-costs.create')}>
                                    <PrimaryButton>Tambah Biaya Baru</PrimaryButton>
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Biaya</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipe Biaya</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai Biaya</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Satuan</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {operationalCosts.map((cost) => (
                                            <tr key={cost.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{cost.nama_biaya}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cost.tipe_biaya}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{formatCurrency(cost.nilai_biaya)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cost.satuan}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Link href={route('operational-costs.edit', cost.id)}>
                                                        <PrimaryButton className="text-xs !bg-yellow-500 hover:!bg-yellow-600 focus:!ring-yellow-500">Edit</PrimaryButton>
                                                    </Link>
                                                    <Link
                                                        href={route('operational-costs.destroy', cost.id)}
                                                        method="delete"
                                                        as="button"
                                                        type="button"
                                                        onBefore={() => confirm(`Yakin ingin menghapus biaya "${cost.nama_biaya}"?`)}
                                                        preserveScroll
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        Hapus
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {operationalCosts.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Belum ada data biaya operasional.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}