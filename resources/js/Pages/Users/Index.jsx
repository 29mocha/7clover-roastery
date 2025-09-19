// resources/js/Pages/Users/Index.jsx

import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PrimaryButton from '../../Components/PrimaryButton';

export default function Index({ auth, users, flash }) {
    const getRoleClass = (roles) => {
        if (roles.some(role => role.name === 'Admin')) {
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
        }
        if (roles.some(role => role.name === 'Roaster')) {
            return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
        }
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen User</h2>}
        >
            <Head title="Manajemen User" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            {flash.success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:border-green-600 dark:text-green-200">{flash.success}</div>)}
                            {flash.error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-200">{flash.error}</div>)}

                            <div className="mb-6 flex justify-end">
                                <Link href={route('users.create')}>
                                    <PrimaryButton>Tambah User Baru</PrimaryButton>
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peran (Role)</th>
                                            {/* KOLOM "TERVERIFIKASI" DIHAPUS DARI SINI */}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.roles)}`}>
                                                        {user.roles.length > 0 ? user.roles.map(role => role.name).join(', ') : 'Tanpa Peran'}
                                                    </span>
                                                </td>
                                                {/* DATA "TERVERIFIKASI" DIHAPUS DARI SINI */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                    <Link href={route('users.edit', user.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                                                        Edit
                                                    </Link>
                                                    
                                                    {auth.user.id !== user.id && (
                                                        <Link
                                                            href={route('users.destroy', user.id)}
                                                            method="delete"
                                                            as="button"
                                                            type="button"
                                                            onBefore={() => confirm(`Yakin ingin menghapus user "${user.name}"?`)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                                        >
                                                            Hapus
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Belum ada data user.
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

