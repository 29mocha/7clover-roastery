// resources/js/Pages/PackagingItems/Edit.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, packagingItem }) {
    // packagingItem adalah data yang dikirim dari controller
    const { data, setData, put, processing, errors } = useForm({
        // Inisialisasi form dengan data yang sudah ada
        nama_item: packagingItem.nama_item || '',
        tipe_item: packagingItem.tipe_item || '',
        stok: packagingItem.stok || 0,
        biaya_per_item: packagingItem.biaya_per_item || '',
        catatan: packagingItem.catatan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Kirim data menggunakan method PUT ke route update
        put(route('packaging-items.update', packagingItem.id));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Item Kemasan</h2>}
        >
            <Head title={`Edit Item - ${data.nama_item}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama_item" value="Nama Item *" />
                                    <TextInput
                                        id="nama_item" name="nama_item" value={data.nama_item}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('nama_item', e.target.value)} required
                                    />
                                    <InputError message={errors.nama_item} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tipe_item" value="Tipe Item (Opsional)" />
                                    <TextInput
                                        id="tipe_item" name="tipe_item" value={data.tipe_item}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('tipe_item', e.target.value)}
                                    />
                                    <InputError message={errors.tipe_item} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="stok" value="Stok Saat Ini (pcs) *" />
                                        <TextInput
                                            id="stok" type="number" name="stok"
                                            value={data.stok} className="mt-1 block w-full"
                                            min="0"
                                            onChange={(e) => setData('stok', e.target.value)} required
                                        />
                                        <InputError message={errors.stok} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="biaya_per_item" value="Biaya per Item (Rp) *" />
                                        <TextInput
                                            id="biaya_per_item" type="number" name="biaya_per_item"
                                            value={data.biaya_per_item} className="mt-1 block w-full"
                                            step="0.01" min="0"
                                            onChange={(e) => setData('biaya_per_item', e.target.value)} required
                                        />
                                        <InputError message={errors.biaya_per_item} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="catatan" value="Catatan (Opsional)" />
                                    <textarea
                                        id="catatan" name="catatan" value={data.catatan}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="3"
                                        onChange={(e) => setData('catatan', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.catatan} className="mt-2" />
                                </div>


                                <div className="flex items-center justify-end mt-6">
                                    <Link
                                        href={route('packaging-items.index')}
                                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 mr-4"
                                    >
                                        Batal
                                    </Link>

                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update Item'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}