// resources/js/Pages/OperationalCosts/Edit.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, operationalCost }) {
    // operationalCost adalah data yang dikirim dari controller
    const { data, setData, put, processing, errors } = useForm({
        // Inisialisasi form dengan data yang sudah ada
        nama_biaya: operationalCost.nama_biaya || '',
        tipe_biaya: operationalCost.tipe_biaya || 'per_jam',
        nilai_biaya: operationalCost.nilai_biaya || '',
        satuan: operationalCost.satuan || '',
        catatan: operationalCost.catatan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Kirim data menggunakan method PUT ke route update
        put(route('operational-costs.update', operationalCost.id));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Biaya Operasional</h2>}
        >
            <Head title={`Edit Biaya - ${data.nama_biaya}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama_biaya" value="Nama Biaya *" />
                                    <TextInput
                                        id="nama_biaya" name="nama_biaya" value={data.nama_biaya}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('nama_biaya', e.target.value)} required
                                    />
                                    <InputError message={errors.nama_biaya} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tipe_biaya" value="Tipe Biaya *" />
                                    <select
                                        id="tipe_biaya" name="tipe_biaya" value={data.tipe_biaya}
                                        onChange={(e) => setData('tipe_biaya', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="per_jam">Per Jam</option>
                                        <option value="per_batch">Per Batch</option>
                                    </select>
                                    <InputError message={errors.tipe_biaya} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nilai_biaya" value="Nilai Biaya (Rp) *" />
                                    <TextInput
                                        id="nilai_biaya" type="number" name="nilai_biaya"
                                        value={data.nilai_biaya} className="mt-1 block w-full"
                                        step="0.01" min="0"
                                        onChange={(e) => setData('nilai_biaya', e.target.value)} required
                                    />
                                    <InputError message={errors.nilai_biaya} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="satuan" value="Satuan (Opsional)" />
                                    <TextInput
                                        id="satuan" name="satuan" value={data.satuan}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('satuan', e.target.value)}
                                    />
                                    <InputError message={errors.satuan} className="mt-2" />
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
                                        href={route('operational-costs.index')}
                                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 mr-4"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update Biaya'}
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