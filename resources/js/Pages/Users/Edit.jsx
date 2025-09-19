// resources/js/Pages/Users/Edit.jsx

import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import InputError from '../../Components/InputError';
import InputLabel from '../../Components/InputLabel';
import PrimaryButton from '../../Components/PrimaryButton';
import TextInput from '../../Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

// 1. Terima 'user' dan 'roles' sebagai props
export default function Edit({ auth, user, roles }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        // 2. Set nilai default dari peran yang sudah dimiliki user
        // Ambil nama dari elemen pertama di array 'roles' milik user
        role: user.roles.length > 0 ? user.roles[0].name : '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit User: {user.name}</h2>}
        >
            <Head title={`Edit User - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama *" />
                                    <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="mt-1 block w-full" isFocused />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email *" />
                                    <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required className="mt-1 block w-full" />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                {/* ==== PERUBAHAN UTAMA DI SINI ==== */}
                                <div>
                                    <InputLabel htmlFor="role" value="Peran (Role) *" />
                                    <select
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        required
                                    >
                                        {/* 3. Buat <option> secara dinamis dari props 'roles' */}
                                        {roles.map((roleName) => (
                                            <option key={roleName} value={roleName}>
                                                {roleName}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password Baru (Opsional)" />
                                    <TextInput id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 block w-full" />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Kosongkan jika tidak ingin mengubah password.</p>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" />
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <Link href={route('users.index')} className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 mr-4">
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>{processing ? 'Menyimpan...' : 'Update User'}</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

