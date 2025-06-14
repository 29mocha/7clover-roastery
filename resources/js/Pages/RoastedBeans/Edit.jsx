// resources/js/Pages/RoastedBeans/Edit.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput'; // Untuk input number juga bisa
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react'; // Untuk debugging jika diperlukan

export default function Edit({ auth, roastedBean }) {
    // roastedBean adalah objek yang akan diedit, dikirim dari RoastedBeanController@edit
    const { errors: pageErrors } = usePage().props; // Error global dari Inertia (jarang dipakai jika error field spesifik)

    const { data, setData, put, processing, errors, progress } = useForm({
        // Hanya field yang akan diubah yang perlu ada di sini untuk dikirim
        // atau semua field untuk pre-fill, tapi hanya kirim yang relevan
        stok_tersisa_g: roastedBean.stok_tersisa_g || 0,
        catatan_item: roastedBean.catatan_item || '',
        // _method: 'PUT' // Tidak perlu jika menggunakan form.put
    });

    // Data yang hanya untuk ditampilkan (tidak diubah dari form ini)
    const displayData = {
        nama_produk_sangrai: roastedBean.nama_produk_sangrai || 'N/A',
        tanggal_roasting: roastedBean.tanggal_roasting ? new Date(roastedBean.tanggal_roasting).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A',
        stok_awal_g: roastedBean.stok_awal_g || 0,
        roast_level: roastedBean.roast_level || 'N/A',
        roast_batch_number: roastedBean.roast_batch?.nomor_batch_roasting || 'N/A', // Akses nomor batch jika relasi di-load
    };

    const submit = (e) => {
        e.preventDefault();
        // Kirim hanya data yang memang diizinkan untuk diubah oleh form ini
        const dataToSubmit = {
            stok_tersisa_g: data.stok_tersisa_g,
            catatan_item: data.catatan_item,
        };
        put(route('roasted-beans.update', roastedBean.id), {
            data: dataToSubmit, // Eksplisit kirim data yang relevan
            preserveScroll: true, // Agar halaman tidak scroll ke atas setelah submit
            // onSuccess: () => { /* Aksi setelah sukses, biasanya redirect dari controller sudah cukup */ },
            // onError: (formErrors) => { console.error('Form errors:', formErrors); }
        });
    };
    
    // Untuk debugging props saat komponen pertama kali render atau saat prop roastedBean berubah
    useEffect(() => {
        console.log("RoastedBeans/Edit.jsx - Props received:", { auth, roastedBean });
        // Inisialisasi ulang form data jika roastedBean prop berubah (penting jika komponen tidak di-unmount/remount antar edit)
        setData({
            stok_tersisa_g: roastedBean.stok_tersisa_g || 0,
            catatan_item: roastedBean.catatan_item || '',
        });
    }, [roastedBean]); // Dependency array

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Edit Inventaris: {displayData.nama_produk_sangrai}
                </h2>
            }
        >
            <Head title={`Edit Inventaris - ${displayData.nama_produk_sangrai}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            {/* Menampilkan error global dari controller jika ada */}
                            {pageErrors && pageErrors.error && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {pageErrors.error}
                                </div>
                            )}

                            {/* Informasi Read-only */}
                            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Informasi Produk (Tidak Dapat Diubah Disini)</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><strong className="text-gray-500 dark:text-gray-400">Nama Produk:</strong> {displayData.nama_produk_sangrai}</p>
                                    <p><strong className="text-gray-500 dark:text-gray-400">Tgl Roasting:</strong> {displayData.tanggal_roasting}</p>
                                    <p><strong className="text-gray-500 dark:text-gray-400">Roast Level:</strong> {displayData.roast_level}</p>
                                    <p><strong className="text-gray-500 dark:text-gray-400">Asal Batch:</strong> {displayData.roast_batch_number}</p>
                                    <p><strong className="text-gray-500 dark:text-gray-400">Stok Awal (dari Batch):</strong> {displayData.stok_awal_g} gram</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="stok_tersisa_g" value="Stok Tersisa (gram) *" />
                                    <TextInput
                                        id="stok_tersisa_g"
                                        type="number"
                                        name="stok_tersisa_g"
                                        value={data.stok_tersisa_g}
                                        className="mt-1 block w-full"
                                        step="0.1" // Sesuaikan jika perlu desimal, atau "1" untuk integer
                                        min="0"
                                        max={roastedBean.stok_awal_g} // Batas maksimal adalah stok awal
                                        onChange={(e) => setData('stok_tersisa_g', e.target.value)}
                                        required
                                        isFocused={true} // Fokus ke field ini saat form dimuat
                                    />
                                    <InputError message={errors.stok_tersisa_g || (pageErrors && pageErrors.stok_tersisa_g)} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Update jumlah stok yang tersisa saat ini. Maksimal: {roastedBean.stok_awal_g}g.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="catatan_item" value="Catatan Item" />
                                    <textarea
                                        id="catatan_item"
                                        name="catatan_item"
                                        value={data.catatan_item}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="4"
                                        onChange={(e) => setData('catatan_item', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.catatan_item} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        href={route('roasted-beans.show', roastedBean.id)} // Kembali ke halaman show
                                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 mr-4"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update Inventaris'}
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