// resources/js/Pages/RoastBatches/Create.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Create({ auth, greenBeans }) {
    const { errors: pageErrors } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        green_bean_id: '',
        nomor_batch_roasting: '',
        tanggal_roasting: new Date().toISOString().split('T')[0],
        nama_operator: auth.user.name || '',
        mesin_roasting: '',
        berat_green_bean_digunakan_g: '',
        berat_total_roasted_bean_dihasilkan_g: '',
        roast_level: 'Medium',
        waktu_roasting_total_menit: '',
        suhu_akhir_celsius: '',
        catatan_roasting: '',
    });

    const availableRoastLevels = [
        { value: 'Light', label: 'Light Roast' },
        { value: 'Medium Light', label: 'Medium-Light Roast' },
        { value: 'Medium', label: 'Medium Roast' },
        { value: 'Medium Dark', label: 'Medium-Dark Roast' },
        { value: 'Dark', label: 'Dark Roast' },
    ];

    const selectedGreenBean = greenBeans.find(gb => gb.id === parseInt(data.green_bean_id));

    const submit = (e) => {
        e.preventDefault();
        post(route('roast-batches.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Buat Roast Batch Baru</h2>}
        >
            <Head title="Buat Roast Batch" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            {pageErrors && pageErrors.error && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {pageErrors.error}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="green_bean_id" value="Pilih Green Bean *" />
                                    <select
                                        id="green_bean_id"
                                        name="green_bean_id"
                                        value={data.green_bean_id}
                                        onChange={(e) => setData('green_bean_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">-- Pilih Green Bean --</option>
                                        {greenBeans.map((bean) => (
                                            <option key={bean.id} value={bean.id}>
                                                {/* ==== PERBAIKAN DI SINI ==== */}
                                                {bean.nama_kopi} ({bean.lot_identifier}) - Stok: {bean.stok_saat_ini_g.toLocaleString('id-ID')} g
                                            </option>
                                        ))}
                                    </select>
                                    {selectedGreenBean && (
                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                            {/* ==== PERBAIKAN DI SINI ==== */}
                                            Stok tersedia: {selectedGreenBean.stok_saat_ini_g.toLocaleString('id-ID')} gram
                                        </p>
                                    )}
                                    <InputError message={errors.green_bean_id} className="mt-2" />
                                </div>

                                {/* ... (sisa field form lainnya tidak berubah) ... */}
                                <div><InputLabel htmlFor="nomor_batch_roasting" value="Nomor Batch Roasting (Unik) *" /><TextInput id="nomor_batch_roasting" name="nomor_batch_roasting" value={data.nomor_batch_roasting} className="mt-1 block w-full" onChange={(e) => setData('nomor_batch_roasting', e.target.value)} required placeholder="Contoh: RB-YYMMDD-01" /><InputError message={errors.nomor_batch_roasting} className="mt-2" /></div>
                                <div><InputLabel htmlFor="tanggal_roasting" value="Tanggal Roasting *" /><TextInput id="tanggal_roasting" type="date" name="tanggal_roasting" value={data.tanggal_roasting} className="mt-1 block w-full" onChange={(e) => setData('tanggal_roasting', e.target.value)} required /><InputError message={errors.tanggal_roasting} className="mt-2" /></div>
                                <div><InputLabel htmlFor="nama_operator" value="Nama Operator *" /><TextInput id="nama_operator" name="nama_operator" value={data.nama_operator} className="mt-1 block w-full" onChange={(e) => setData('nama_operator', e.target.value)} required /><InputError message={errors.nama_operator} className="mt-2" /></div>
                                <div><InputLabel htmlFor="mesin_roasting" value="Mesin Roasting" /><TextInput id="mesin_roasting" name="mesin_roasting" value={data.mesin_roasting} className="mt-1 block w-full" onChange={(e) => setData('mesin_roasting', e.target.value)} /><InputError message={errors.mesin_roasting} className="mt-2" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><InputLabel htmlFor="berat_green_bean_digunakan_g" value="Berat Green Bean Digunakan (gram) *" /><TextInput id="berat_green_bean_digunakan_g" type="number" name="berat_green_bean_digunakan_g" value={data.berat_green_bean_digunakan_g} className="mt-1 block w-full" step="1" min="1" onChange={(e) => setData('berat_green_bean_digunakan_g', e.target.value)} required /><InputError message={errors.berat_green_bean_digunakan_g} className="mt-2" /></div><div><InputLabel htmlFor="berat_total_roasted_bean_dihasilkan_g" value="Berat Roasted Bean Dihasilkan (gram) *" /><TextInput id="berat_total_roasted_bean_dihasilkan_g" type="number" name="berat_total_roasted_bean_dihasilkan_g" value={data.berat_total_roasted_bean_dihasilkan_g} className="mt-1 block w-full" step="1" min="1" onChange={(e) => setData('berat_total_roasted_bean_dihasilkan_g', e.target.value)} required /><InputError message={errors.berat_total_roasted_bean_dihasilkan_g} className="mt-2" /></div></div>
                                <div><InputLabel htmlFor="roast_level" value="Roast Level *" /><select id="roast_level" name="roast_level" value={data.roast_level} onChange={(e) => setData('roast_level', e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" required>{availableRoastLevels.map(level => ( <option key={level.value} value={level.value}>{level.label}</option> ))}</select><InputError message={errors.roast_level} className="mt-2" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><InputLabel htmlFor="waktu_roasting_total_menit" value="Waktu Roasting Total (menit)" /><TextInput id="waktu_roasting_total_menit" type="number" name="waktu_roasting_total_menit" value={data.waktu_roasting_total_menit} className="mt-1 block w-full" step="1" min="0" onChange={(e) => setData('waktu_roasting_total_menit', e.target.value)} /><InputError message={errors.waktu_roasting_total_menit} className="mt-2" /></div><div><InputLabel htmlFor="suhu_akhir_celsius" value="Suhu Akhir (°C)" /><TextInput id="suhu_akhir_celsius" type="number" name="suhu_akhir_celsius" value={data.suhu_akhir_celsius} className="mt-1 block w-full" step="1" onChange={(e) => setData('suhu_akhir_celsius', e.target.value)} /><InputError message={errors.suhu_akhir_celsius} className="mt-2" /></div></div>
                                <div><InputLabel htmlFor="catatan_roasting" value="Catatan Roasting" /><textarea id="catatan_roasting" name="catatan_roasting" value={data.catatan_roasting} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" rows="3" onChange={(e) => setData('catatan_roasting', e.target.value)}></textarea><InputError message={errors.catatan_roasting} className="mt-2" /></div>
                                
                                <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Link href={route('roast-batches.index')} className="underline text-sm ... mr-4">Batal</Link>
                                    <PrimaryButton disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Roast Batch'}</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}