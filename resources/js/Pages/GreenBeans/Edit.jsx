import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, greenBean }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_kopi: greenBean.nama_kopi || '',
        lot_identifier: greenBean.lot_identifier || '',
        tanggal_terima: greenBean.tanggal_terima ? new Date(greenBean.tanggal_terima).toISOString().split('T')[0] : '',
        origin: greenBean.origin || '',
        varietas: greenBean.varietas || '',
        processing_method: greenBean.processing_method || '',
        processor: greenBean.processor || '',
        altitude: greenBean.altitude || '',
        supplier: greenBean.supplier || '',
        harga_beli_per_kg: greenBean.harga_beli_per_kg || '',
        tasting_notes: greenBean.tasting_notes || '',
        catatan: greenBean.catatan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('green-beans.update', greenBean.id));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Edit Green Bean: {data.nama_kopi}
                </h2>
            }
        >
            <Head title={`Edit Green Bean - ${data.nama_kopi}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700/50">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stok Saat Ini (Tidak dapat diubah disini): 
                                    <span className="font-semibold text-lg text-indigo-600 dark:text-indigo-400"> {greenBean.stok_saat_ini_g.toLocaleString('id-ID')} gram</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Gunakan fitur "Sesuaikan Stok" di halaman detail untuk mengubah stok.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="nama_kopi" value="Nama Kopi *" />
                                    <TextInput id="nama_kopi" name="nama_kopi" value={data.nama_kopi} className="mt-1 block w-full" onChange={(e) => setData('nama_kopi', e.target.value)} required />
                                    <InputError message={errors.nama_kopi} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="lot_identifier" value="Lot Identifier (Unik) *" />
                                    <TextInput id="lot_identifier" name="lot_identifier" value={data.lot_identifier} className="mt-1 block w-full" onChange={(e) => setData('lot_identifier', e.target.value)} required />
                                    <InputError message={errors.lot_identifier} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="tanggal_terima" value="Tanggal Terima *" />
                                    <TextInput id="tanggal_terima" type="date" name="tanggal_terima" value={data.tanggal_terima} className="mt-1 block w-full" onChange={(e) => setData('tanggal_terima', e.target.value)} required />
                                    <InputError message={errors.tanggal_terima} className="mt-2" />
                                </div>
                                
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Detail Informasi (Opsional)</h3>
                                    <div><InputLabel htmlFor="harga_beli_per_kg" value="Harga Beli (per kg)" /><TextInput id="harga_beli_per_kg" type="number" name="harga_beli_per_kg" value={data.harga_beli_per_kg} className="mt-1 block w-full" step="0.01" min="0" onChange={(e) => setData('harga_beli_per_kg', e.target.value)} /><InputError message={errors.harga_beli_per_kg} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="origin" value="Origin" /><TextInput id="origin" name="origin" value={data.origin} className="mt-1 block w-full" onChange={(e) => setData('origin', e.target.value)} /><InputError message={errors.origin} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="altitude" value="Ketinggian (Altitude)" /><TextInput id="altitude" name="altitude" value={data.altitude} className="mt-1 block w-full" placeholder="Contoh: 1200-1500 MASL" onChange={(e) => setData('altitude', e.target.value)} /><InputError message={errors.altitude} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="varietas" value="Varietas" /><TextInput id="varietas" name="varietas" value={data.varietas} className="mt-1 block w-full" onChange={(e) => setData('varietas', e.target.value)} /><InputError message={errors.varietas} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="processing_method" value="Metode Proses" /><TextInput id="processing_method" name="processing_method" value={data.processing_method} className="mt-1 block w-full" placeholder="Contoh: Natural, Washed, Honey" onChange={(e) => setData('processing_method', e.target.value)} /><InputError message={errors.processing_method} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="processor" value="Processor" /><TextInput id="processor" name="processor" value={data.processor} className="mt-1 block w-full" placeholder="Nama petani atau stasiun proses" onChange={(e) => setData('processor', e.target.value)} /><InputError message={errors.processor} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="supplier" value="Supplier" /><TextInput id="supplier" name="supplier" value={data.supplier} className="mt-1 block w-full" onChange={(e) => setData('supplier', e.target.value)} /><InputError message={errors.supplier} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="tasting_notes" value="Tasting Notes" /><textarea id="tasting_notes" name="tasting_notes" value={data.tasting_notes} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" rows="3" placeholder="Contoh: Fruity, Chocolate, Floral" onChange={(e) => setData('tasting_notes', e.target.value)}></textarea><InputError message={errors.tasting_notes} className="mt-2" /></div>
                                    <div><InputLabel htmlFor="catatan" value="Catatan Tambahan" /><textarea id="catatan" name="catatan" value={data.catatan} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" rows="3" onChange={(e) => setData('catatan', e.target.value)}></textarea><InputError message={errors.catatan} className="mt-2" /></div>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <Link href={route('green-beans.show', greenBean.id)} className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 mr-4">Batal</Link>
                                    <PrimaryButton disabled={processing}>{processing ? 'Menyimpan...' : 'Update Green Bean'}</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}