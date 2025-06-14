import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox'; // <-- Pastikan ini di-import
import InputError from '@/Components/InputError';
import { useState, useEffect, useMemo } from 'react';

// ==== Komponen Kalkulator HPP diletakkan di sini, sebagai komponen terpisah ====
function HppCalculator({ greenBean, packagingItems, operationalCosts, settings }) {
    const [calcData, setCalcData] = useState({
        assumedWeightLoss: settings.average_weight_loss_percent?.value || '18',
        assumedRoastTime: '12',
        profitMargin: settings.default_profit_margin?.value || '20',
        selectedPackaging: {},
    });

    const [results, setResults] = useState(null);

    const handleCalcChange = (e) => {
        setCalcData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePackagingChange = (id) => {
        setCalcData(prev => {
            const newPackaging = { ...prev.selectedPackaging };
            if (newPackaging[id]) {
                delete newPackaging[id];
            } else {
                newPackaging[id] = 1;
            }
            return { ...prev, selectedPackaging: newPackaging };
        });
    };

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const calculateHpp = () => {
        if (!greenBean.harga_beli_per_kg) {
            alert('Harga beli per kg untuk green bean ini belum diatur. Harap update terlebih dahulu.');
            return;
        }
        const yieldPercent = 1 - (parseFloat(calcData.assumedWeightLoss) / 100);
        if (yieldPercent <= 0) {
            alert('Susut bobot tidak boleh 100% atau lebih.');
            return;
        }
        const greenBeanCostPerGramRoasted = (parseFloat(greenBean.harga_beli_per_kg) / 1000) / yieldPercent;
        const hourlyCosts = operationalCosts.filter(c => c.tipe_biaya === 'per_jam').reduce((sum, c) => sum + parseFloat(c.nilai_biaya), 0);
        const batchCosts = operationalCosts.filter(c => c.tipe_biaya === 'per_batch').reduce((sum, c) => sum + parseFloat(c.nilai_biaya), 0);
        const totalOpCostPerBatch = batchCosts + ((hourlyCosts / 60) * parseFloat(calcData.assumedRoastTime));
        const opCostPerGramRoasted = totalOpCostPerBatch / (1000 * yieldPercent);
        const packagingCost = Object.keys(calcData.selectedPackaging).reduce((sum, id) => {
            const item = packagingItems.find(pi => pi.id == id);
            return sum + (parseFloat(item.biaya_per_item) * calcData.selectedPackaging[id]);
        }, 0);

        const packageSizes = [100, 200, 500, 1000];
        const calculatedResults = packageSizes.map(size => {
            const coffeeCost = greenBeanCostPerGramRoasted * size;
            const operationalCost = opCostPerGramRoasted * size;
            const totalHpp = coffeeCost + operationalCost + packagingCost;
            const profit = totalHpp * (parseFloat(calcData.profitMargin) / 100);
            const sellingPrice = totalHpp + profit;
            return { size, coffeeCost, operationalCost, packagingCost, totalHpp, sellingPrice };
        });
        setResults(calculatedResults);
    };

    return (
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Kalkulator Saran Harga Jual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border dark:border-gray-600 rounded-lg">
                <div className="space-y-4">
                    <h4 className="font-semibold">Asumsi Produksi</h4>
                    <div><InputLabel htmlFor="assumedWeightLoss" value={`Susut Bobot (%)`} /><TextInput id="assumedWeightLoss" name="assumedWeightLoss" type="number" step="0.1" value={calcData.assumedWeightLoss} onChange={handleCalcChange} className="mt-1 block w-full" /></div>
                    <div><InputLabel htmlFor="assumedRoastTime" value={`Durasi Roasting (menit)`} /><TextInput id="assumedRoastTime" name="assumedRoastTime" type="number" step="1" value={calcData.assumedRoastTime} onChange={handleCalcChange} className="mt-1 block w-full" /></div>
                    <div><InputLabel htmlFor="profitMargin" value={`Margin Keuntungan (%)`} /><TextInput id="profitMargin" name="profitMargin" type="number" step="1" value={calcData.profitMargin} onChange={handleCalcChange} className="mt-1 block w-full" /></div>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Pilih Kemasan</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 border dark:border-gray-600 rounded-md p-2">{packagingItems.map(item => (
                        <label key={item.id} className="flex items-center text-sm p-1 cursor-pointer"><Checkbox name="packaging" checked={!!calcData.selectedPackaging[item.id]} onChange={() => handlePackagingChange(item.id)} /><span className="ms-2 text-gray-600 dark:text-gray-400">{item.nama_item} ({formatCurrency(item.biaya_per_item)})</span></label>
                    ))}</div>
                </div>
                <div className="flex flex-col justify-between"><PrimaryButton onClick={calculateHpp} className="w-full">Hitung Harga Jual</PrimaryButton>{results && (<div className="mt-4 text-xs text-gray-500 dark:text-gray-400"><p><strong>Biaya Green Bean:</strong> {formatCurrency(results[0].coffeeCost / results[0].size)}/g</p><p><strong>Biaya Operasional:</strong> {formatCurrency(results[0].operationalCost / results[0].size)}/g</p><p><strong>Biaya Kemasan:</strong> {formatCurrency(results[0].packagingCost)}</p></div>)}</div>
            </div>
            {results && (
                <div className="mt-6"><h4 className="font-semibold text-md mb-2">Hasil Perhitungan:</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{results.map(res => (<div key={res.size} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"><div className="font-bold text-lg">{res.size} gram</div><div className="text-xs mt-2">HPP Total: <span className="font-semibold">{formatCurrency(res.totalHpp)}</span></div><div className="text-green-600 dark:text-green-400 font-bold text-xl mt-1">{formatCurrency(res.sellingPrice)}</div><div className="text-xs text-gray-500 dark:text-gray-400">(Margin {calcData.profitMargin}%)</div></div>))}</div></div>
            )}
        </div>
    );
}

// ==== Komponen Utama Halaman Show ====
export default function Show({ auth, greenBean, flash, packagingItems, operationalCosts, settings }) {
    const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        adjustment_quantity_g: '', adjustment_type: 'decrease', reason: '', adjustment_date: new Date().toISOString().slice(0, 16),
    });
    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };
    const openAdjustStockModal = () => { reset(); setData('adjustment_date', new Date().toISOString().slice(0, 16)); setIsAdjustStockModalOpen(true); };
    const closeAdjustStockModal = () => { setIsAdjustStockModalOpen(false); };
    const handleAdjustmentSubmit = (e) => { e.preventDefault(); post(route('green-beans.adjust-stock', greenBean.id), { preserveScroll: true, onSuccess: () => {}, }); };
    useEffect(() => { if (recentlySuccessful && isAdjustStockModalOpen) { closeAdjustStockModal(); } }, [recentlySuccessful, isAdjustStockModalOpen]);
    const adjustmentTypes = [{ value: 'correction', label: 'Koreksi Stok' }, { value: 'increase', label: 'Penambahan' }, { value: 'decrease', label: 'Pengurangan' }];

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Detail Green Bean: {greenBean.nama_kopi} ({greenBean.lot_identifier})
                </h2>
            }
        >
            <Head title={`Detail Green Bean - ${greenBean.nama_kopi}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {flash && flash.success && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">{flash.success}</div>
                    )}
                    {flash && flash.error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">{flash.error}</div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 sm:p-8 text-gray-900 dark:text-gray-100">
                            {/* Detail Utama Green Bean */}
                            <div className="space-y-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Kopi</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.nama_kopi}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Lot Identifier</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.lot_identifier}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Terima</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(greenBean.tanggal_terima)}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Harga Beli (per kg)</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.harga_beli_per_kg ? parseFloat(greenBean.harga_beli_per_kg).toLocaleString('id-ID', {style:'currency', currency:'IDR'}) : 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.origin || 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Altitude</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.altitude || 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Varietas</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.varietas || 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Metode Proses</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.processing_method || 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Processor</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.processor || 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.supplier || 'N/A'}</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Jumlah Awal Diterima</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{greenBean.jumlah_awal_g.toLocaleString('id-ID')} gram</dd></div>
                                    <div className="sm:col-span-1"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Saat Ini</dt><dd className="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400">{greenBean.stok_saat_ini_g.toLocaleString('id-ID')} gram</dd></div>
                                    <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasting Notes</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{greenBean.tasting_notes || 'Tidak ada catatan.'}</dd></div>
                                    <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Catatan Tambahan</dt><dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{greenBean.catatan || 'Tidak ada catatan.'}</dd></div>
                                </dl>
                                <HppCalculator 
                                    greenBean={greenBean} 
                                    packagingItems={packagingItems}
                                    operationalCosts={operationalCosts}
                                    settings={settings}
                                />
                                {/* Riwayat Penggunaan di Roast Batch */}
                                {greenBean.roast_batches && greenBean.roast_batches.length > 0 && (
                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Riwayat Penggunaan di Roast Batch</h3>
                                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tgl Roasting</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No. Batch</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah Digunakan (g)</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roast Level</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                            </tr></thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{greenBean.roast_batches.map((batch) => (
                                                <tr key={batch.id}><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(batch.tanggal_roasting)}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{batch.nomor_batch_roasting}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{batch.berat_green_bean_digunakan_g.toLocaleString('id-ID')}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{batch.roast_level}</td><td className="px-4 py-4 whitespace-nowrap text-sm"><Link href={route('roast-batches.show', batch.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Lihat Detail Batch</Link></td></tr>
                                            ))}</tbody>
                                        </table></div>
                                    </div>
                                )}

                                {/* Riwayat Penyesuaian Stok */}
                                {greenBean.stock_adjustments && greenBean.stock_adjustments.length > 0 && (
                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Riwayat Penyesuaian Stok</h3>
                                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipe</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jumlah (g)</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok Sebelum (g)</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok Sesudah (g)</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Alasan</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Oleh</th>
                                            </tr></thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{greenBean.stock_adjustments.map((adj) => (
                                                <tr key={adj.id}><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(adj.adjustment_date, true)}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{adj.adjustment_type}</td><td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${parseFloat(adj.quantity_adjusted_g) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{parseFloat(adj.quantity_adjusted_g) >= 0 ? '+' : ''}{parseFloat(adj.quantity_adjusted_g).toLocaleString('id-ID')}g</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{parseFloat(adj.stock_before_adjustment_g).toLocaleString('id-ID')}g</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{parseFloat(adj.stock_after_adjustment_g).toLocaleString('id-ID')}g</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={adj.reason}>{adj.reason || '-'}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{adj.user ? adj.user.name : 'Sistem'}</td></tr>
                                            ))}</tbody>
                                        </table></div>
                                    </div>
                                )}
                                <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <SecondaryButton onClick={openAdjustStockModal}>Sesuaikan Stok</SecondaryButton>
                                    <Link href={route('green-beans.index')}><SecondaryButton>Kembali ke Daftar</SecondaryButton></Link>
                                    <Link href={route('green-beans.edit', greenBean.id)}><PrimaryButton>Edit Info</PrimaryButton></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal show={isAdjustStockModalOpen} onClose={closeAdjustStockModal} maxWidth="lg">
                    <form onSubmit={handleAdjustmentSubmit} className="p-6 dark:bg-gray-800">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sesuaikan Stok untuk: {greenBean.nama_kopi}</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Stok saat ini: {greenBean.stok_saat_ini_g.toLocaleString('id-ID')} gram.</p>
                        <div className="mt-6"><InputLabel htmlFor="adjustment_type" value="Jenis Penyesuaian *" /><select id="adjustment_type" name="adjustment_type" value={data.adjustment_type} onChange={(e) => setData('adjustment_type', e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" required>{adjustmentTypes.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}</select><InputError message={errors.adjustment_type} className="mt-2" /></div>
                        <div className="mt-4"><InputLabel htmlFor="adjustment_quantity_g">{data.adjustment_type === 'correction' ? 'Set Stok Menjadi (gram) *' : 'Jumlah Penyesuaian (gram) *'}</InputLabel><TextInput id="adjustment_quantity_g" type="number" name="adjustment_quantity_g" value={data.adjustment_quantity_g} className="mt-1 block w-full" step="1" min={data.adjustment_type === 'correction' ? "0" : "1"} onChange={(e) => setData('adjustment_quantity_g', e.target.value)} required isFocused /><InputError message={errors.adjustment_quantity_g} className="mt-2" />{data.adjustment_type !== 'correction' && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Masukkan angka positif. Tipe '{data.adjustment_type}' akan otomatis {data.adjustment_type === 'increase' ? 'menambah' : 'mengurangi'} stok.</p>}</div>
                        <div className="mt-4"><InputLabel htmlFor="adjustment_date" value="Tanggal Penyesuaian (Opsional)" /><TextInput id="adjustment_date" type="datetime-local" name="adjustment_date" value={data.adjustment_date} className="mt-1 block w-full" onChange={(e) => setData('adjustment_date', e.target.value)} /><InputError message={errors.adjustment_date} className="mt-2" /></div>
                        <div className="mt-4"><InputLabel htmlFor="reason" value={`Alasan ${data.adjustment_type === 'correction' || data.adjustment_type === 'spoilage' || data.adjustment_type === 'sample_use' ? '*' : '(Opsional)'}`} /><textarea id="reason" name="reason" value={data.reason} className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" rows="3" onChange={(e) => setData('reason', e.target.value)} required={data.adjustment_type === 'correction' || data.adjustment_type === 'spoilage' || data.adjustment_type === 'sample_use'}></textarea><InputError message={errors.reason} className="mt-2" /></div>
                        <div className="mt-6 flex justify-end"><SecondaryButton type="button" onClick={closeAdjustStockModal}>Batal</SecondaryButton><PrimaryButton className="ms-3" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan Penyesuaian'}</PrimaryButton></div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}