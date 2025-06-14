// resources/js/Pages/RoastBatches/Edit.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
// import SelectInput from '@/Components/SelectInput'; // Jika Anda membuat komponen ini
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Edit({ auth, roastBatch, greenBeans }) {
    // roastBatch adalah objek yang akan diedit, dikirim dari RoastBatchController@edit
    // greenBeans adalah daftar semua green beans, jika Anda ingin mengizinkan perubahan green bean

    const { errors: pageErrors } = usePage().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        // Isi initial state dengan data dari roastBatch yang ada
        green_bean_id: roastBatch.green_bean_id || '',
        nomor_batch_roasting: roastBatch.nomor_batch_roasting || '',
        tanggal_roasting: roastBatch.tanggal_roasting ? new Date(roastBatch.tanggal_roasting).toISOString().split('T')[0] : '',
        nama_operator: roastBatch.nama_operator || '',
        mesin_roasting: roastBatch.mesin_roasting || '',
        berat_green_bean_digunakan_g: roastBatch.berat_green_bean_digunakan_g || '',
        berat_total_roasted_bean_dihasilkan_g: roastBatch.berat_total_roasted_bean_dihasilkan_g || '',
        roast_level: roastBatch.roast_level || 'Medium',
        waktu_roasting_total_menit: roastBatch.waktu_roasting_total_menit || '',
        suhu_akhir_celsius: roastBatch.suhu_akhir_celsius || '',
        catatan_roasting: roastBatch.catatan_roasting || '',
    });

    const availableRoastLevels = [
        { value: 'Light', label: 'Light Roast' },
        { value: 'Medium Light', label: 'Medium-Light Roast' },
        { value: 'Medium', label: 'Medium Roast' },
        { value: 'Medium Dark', label: 'Medium-Dark Roast' },
        { value: 'Dark', label: 'Dark Roast' },
    ];
    
    // Untuk menampilkan stok green bean yang dipilih (jika green_bean_id bisa diubah)
    const selectedGreenBean = greenBeans.find(gb => gb.id === parseInt(data.green_bean_id));


    const submit = (e) => {
        e.preventDefault();
        // PERHATIAN: Jika field berat_green_bean_digunakan_g atau berat_total_roasted_bean_dihasilkan_g diubah,
        // backend (RoastBatchController@update) HARUS memiliki logika untuk menyesuaikan stok
        // GreenBean dan RoastedBean terkait, serta menghitung ulang weight_loss_percentage.
        // Versi controller yang kita buat sebelumnya hanya update dasar.
        put(route('roast-batches.update', roastBatch.id), {
            // onSuccess: () => reset(), // Mungkin tidak perlu reset di form edit, atau redirect
        });
    };
    
    // Debugging props
     useEffect(() => {
         console.log("Props diterima di RoastBatches/Edit:", { auth, roastBatch, greenBeans, pageErrors });
         console.log("Initial form data for edit:", data);
     }, [roastBatch]);


    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Edit Roast Batch: {roastBatch.nomor_batch_roasting}
                </h2>
            }
        >
            <Head title={`Edit Batch ${roastBatch.nomor_batch_roasting}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            {pageErrors.error && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {pageErrors.error}
                                </div>
                            )}
                            <form onSubmit={submit} className="space-y-6">
                                {/* Field Green Bean - Mengubah ini akan kompleks terkait stok */}
                                <div>
                                    <InputLabel htmlFor="green_bean_id" value="Green Bean *" />
                                    <select
                                        id="green_bean_id"
                                        name="green_bean_id"
                                        value={data.green_bean_id}
                                        onChange={(e) => setData('green_bean_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        required
                                        // disabled // Pertimbangkan untuk mendisable field ini jika perhitungannya kompleks
                                    >
                                        <option value="">-- Pilih Green Bean --</option>
                                        {greenBeans.map((bean) => (
                                            <option key={bean.id} value={bean.id}>
                                                {bean.nama_kopi} ({bean.lot_identifier}) - Stok: {parseFloat(bean.stok_saat_ini_kg).toFixed(3)} kg
                                            </option>
                                        ))}
                                    </select>
                                    {selectedGreenBean && (
                                         <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                             Pilihan saat ini: {selectedGreenBean.nama_kopi} ({selectedGreenBean.lot_identifier})
                                         </p>
                                     )}
                                    <InputError message={errors.green_bean_id || pageErrors.green_bean_id} className="mt-2" />
                                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Perhatian: Mengubah Green Bean akan memerlukan penyesuaian stok yang kompleks jika batch ini sudah mengurangi stok sebelumnya.</p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="nomor_batch_roasting" value="Nomor Batch Roasting (Unik) *" />
                                    <TextInput
                                        id="nomor_batch_roasting"
                                        name="nomor_batch_roasting"
                                        value={data.nomor_batch_roasting}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nomor_batch_roasting', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nomor_batch_roasting} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tanggal_roasting" value="Tanggal Roasting *" />
                                    <TextInput
                                        id="tanggal_roasting"
                                        type="date"
                                        name="tanggal_roasting"
                                        value={data.tanggal_roasting}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('tanggal_roasting', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tanggal_roasting} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nama_operator" value="Nama Operator *" />
                                    <TextInput
                                        id="nama_operator"
                                        name="nama_operator"
                                        value={data.nama_operator}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nama_operator', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nama_operator} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="mesin_roasting" value="Mesin Roasting" />
                                    <TextInput
                                        id="mesin_roasting"
                                        name="mesin_roasting"
                                        value={data.mesin_roasting}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('mesin_roasting', e.target.value)}
                                    />
                                    <InputError message={errors.mesin_roasting} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="berat_green_bean_digunakan_g" value="Berat Green Bean Digunakan (gram) *" />
                                        <TextInput
                                            id="berat_green_bean_digunakan_g" type="number" name="berat_green_bean_digunakan_g"
                                            value={data.berat_green_bean_digunakan_g}
                                            className="mt-1 block w-full" step="0.1" min="1"
                                            onChange={(e) => setData('berat_green_bean_digunakan_g', e.target.value)}
                                            required
                                            // disabled // Pertimbangkan untuk disable jika tidak ingin ada penyesuaian stok kompleks
                                        />
                                        <InputError message={errors.berat_green_bean_digunakan_g || pageErrors.berat_green_bean_digunakan_g} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="berat_total_roasted_bean_dihasilkan_g" value="Berat Roasted Bean Dihasilkan (gram) *" />
                                        <TextInput
                                            id="berat_total_roasted_bean_dihasilkan_g" type="number" name="berat_total_roasted_bean_dihasilkan_g"
                                            value={data.berat_total_roasted_bean_dihasilkan_g}
                                            className="mt-1 block w-full" step="0.1" min="1"
                                            onChange={(e) => setData('berat_total_roasted_bean_dihasilkan_g', e.target.value)}
                                            required
                                            // disabled // Pertimbangkan untuk disable
                                        />
                                        <InputError message={errors.berat_total_roasted_bean_dihasilkan_g || pageErrors.berat_total_roasted_bean_dihasilkan_g} className="mt-2" />
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Perhatian: Mengubah field berat akan memerlukan penyesuaian stok yang kompleks di backend.</p>


                                <div>
                                    <InputLabel htmlFor="roast_level" value="Roast Level *" />
                                    <select
                                        id="roast_level" name="roast_level" value={data.roast_level}
                                        onChange={(e) => setData('roast_level', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        required
                                    >
                                        {availableRoastLevels.map(level => (
                                            <option key={level.value} value={level.value}>{level.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.roast_level} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="waktu_roasting_total_menit" value="Waktu Roasting Total (menit)" />
                                        <TextInput
                                            id="waktu_roasting_total_menit" type="number" name="waktu_roasting_total_menit"
                                            value={data.waktu_roasting_total_menit}
                                            className="mt-1 block w-full" step="1" min="0"
                                            onChange={(e) => setData('waktu_roasting_total_menit', e.target.value)}
                                        />
                                        <InputError message={errors.waktu_roasting_total_menit} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="suhu_akhir_celsius" value="Suhu Akhir (°C)" />
                                        <TextInput
                                            id="suhu_akhir_celsius" type="number" name="suhu_akhir_celsius"
                                            value={data.suhu_akhir_celsius}
                                            className="mt-1 block w-full" step="1"
                                            onChange={(e) => setData('suhu_akhir_celsius', e.target.value)}
                                        />
                                        <InputError message={errors.suhu_akhir_celsius} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="catatan_roasting" value="Catatan Roasting" />
                                    <textarea
                                        id="catatan_roasting" name="catatan_roasting" value={data.catatan_roasting}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="3"
                                        onChange={(e) => setData('catatan_roasting', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.catatan_roasting} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        href={route('roast-batches.show', roastBatch.id)} // Kembali ke halaman show
                                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 mr-4"
                                    >
                                        Batal
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update Roast Batch'}
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