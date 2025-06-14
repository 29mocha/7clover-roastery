// resources/js/Pages/Settings/Index.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, settings, flash }) {
    // settings adalah objek: { default_profit_margin: { id: 1, key: ..., value: ... } }

    // Ambil data pengaturan untuk margin, sediakan nilai default jika tidak ada
    const profitMarginSetting = settings.default_profit_margin;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        // Gunakan optional chaining (?.) untuk keamanan saat mengambil nilai
        default_profit_margin: profitMarginSetting?.value || '20',
        // Tambahkan key pengaturan lain di sini jika ada nanti
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengaturan Umum</h2>}
        >
            <Head title="Pengaturan Umum" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pengaturan Aplikasi</h3>
                            
                            {flash.success && (
                                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                                    {flash.success}
                                </div>
                            )}

                            {/* Hanya tampilkan form jika data pengaturannya ada */}
                            {profitMarginSetting ? (
                                <div>
                                    <InputLabel htmlFor="default_profit_margin" value={profitMarginSetting.label} />
                                    <TextInput
                                        id="default_profit_margin"
                                        name="default_profit_margin"
                                        type="number"
                                        step="0.1"
                                        value={data.default_profit_margin}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('default_profit_margin', e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Masukkan persentase keuntungan yang diinginkan (contoh: 20 untuk 20%).</p>
                                    <InputError message={errors.default_profit_margin} className="mt-2" />
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg">
                                    Data pengaturan 'default_profit_margin' tidak ditemukan. Jalankan `php artisan db:seed --class=SettingSeeder`.
                                </div>
                            )}

                            {/* Di sini nanti bisa ditambahkan pengaturan lain dengan looping */}

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</PrimaryButton>
                                {recentlySuccessful && <p className="text-sm text-gray-600 dark:text-gray-400">Tersimpan.</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}