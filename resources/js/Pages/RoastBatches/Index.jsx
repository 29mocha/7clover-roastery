// resources/js/Pages/RoastBatches/Index.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react'; // Pastikan 'router' di-import
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Index({ auth, roastBatches, flash, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    // --- PERBARUI DAFTAR KOLOM EKSPOR DI SINI ---
    const allExportableColumns = useMemo(() => [
        { key: 'id', label: 'ID Batch' },
        { key: 'nomor_batch_roasting', label: 'Nomor Batch' },
        { key: 'tanggal_roasting', label: 'Tanggal Roasting' },
        { key: 'green_bean_name', label: 'Green Bean' },
        { key: 'green_bean_lot', label: 'Lot Green Bean' },
        { key: 'berat_green_bean_digunakan_g', label: 'Berat Awal (g)' },
        { key: 'berat_total_roasted_bean_dihasilkan_g', label: 'Berat Hasil (g)' },
        { key: 'weight_loss_percentage', label: 'Weight Loss (%)' },
        { key: 'roast_level', label: 'Roast Level' },
        { key: 'nama_operator', label: 'Operator' },
        { key: 'mesin_roasting', label: 'Mesin Roasting' },
        { key: 'waktu_roasting_total_menit', label: 'Waktu (Menit)' },
        { key: 'suhu_akhir_celsius', label: 'Suhu Akhir (°C)' },
        { key: 'green_bean_cost', label: 'Biaya Green Bean (Rp)' },      // <-- BARU
        { key: 'operational_cost', label: 'Biaya Operasional (Rp)' },    // <-- BARU
        { key: 'total_cost', label: 'Total HPP Batch (Rp)' },         // <-- BARU
        { key: 'catatan_roasting', label: 'Catatan Roasting' },
        { key: 'created_at', label: 'Dibuat Pada' },
        { key: 'updated_at', label: 'Diupdate Pada' },
    ], []);


    const [selectedColumns, setSelectedColumns] = useState(() => {
        const initialCols = {};
        const defaultKeys = ['nomor_batch_roasting', 'tanggal_roasting', 'green_bean_name', 'berat_total_roasted_bean_dihasilkan_g', 'roast_level', 'nama_operator', 'total_cost'];
        allExportableColumns.forEach(col => { initialCols[col.key] = defaultKeys.includes(col.key); });
        return initialCols;
    });

    const handleColumnSelectionChange = (key) => { setSelectedColumns(prev => ({ ...prev, [key]: !prev[key] })); };
    const selectAllCheckboxRef = useRef();
    const selectedCount = Object.values(selectedColumns).filter(Boolean).length;
    const isAllSelected = selectedCount === allExportableColumns.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < allExportableColumns.length;
    useEffect(() => { if (selectAllCheckboxRef.current) { selectAllCheckboxRef.current.indeterminate = isIndeterminate; } }, [isIndeterminate]);
    const handleSelectAllChange = (e) => {
        const newSelectedColumns = {};
        allExportableColumns.forEach(col => { newSelectedColumns[col.key] = e.target.checked; });
        setSelectedColumns(newSelectedColumns);
    };

    const exportUrl = useMemo(() => {
        const url = new URL(route('roast-batches.export'));
        if (filters.search) { url.searchParams.append('search', filters.search); }
        if (filters.trashed) { url.searchParams.append('trashed', filters.trashed); }
        Object.keys(selectedColumns).forEach(key => { if (selectedColumns[key]) { url.searchParams.append('columns[]', key); } });
        return url.href;
    }, [filters, selectedColumns]);
    
    const handleSearch = (e) => { e.preventDefault(); router.get(route('roast-batches.index'), { search: searchTerm, trashed: filters.trashed }, { preserveState: true, replace: true }); };
    useEffect(() => { setSearchTerm(filters.search || ''); }, [filters]);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <AuthenticatedLayout auth={auth} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Roast Batches</h2>}>
            <Head title="Roast Batches" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {flash.success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{flash.success}</div>)}
                            {flash.error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{flash.error}</div>)}

                            <div className="mb-4 flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex border-b border-gray-200 dark:border-gray-700">
                                    <Link href={route('roast-batches.index', { search: filters.search })}>
                                        <button type="button" className={`px-4 py-2 text-sm font-medium ${!filters.trashed ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Aktif</button>
                                    </Link>
                                    <Link href={route('roast-batches.index', { search: filters.search, trashed: 'only' })}>
                                        <button type="button" className={`px-4 py-2 text-sm font-medium ${filters.trashed === 'only' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Arsip</button>
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                                    <Link href={route('roast-batches.create')}><PrimaryButton>Buat Roast Batch</PrimaryButton></Link>
                                    <div className="flex items-center gap-2">
                                        <a href={exportUrl}><SecondaryButton>Export</SecondaryButton></a>
                                        <SecondaryButton className="px-2" onClick={() => setIsColumnModalOpen(true)}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></SecondaryButton>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6"><TextInput type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari di daftar ini..." className="w-full md:w-auto" /><PrimaryButton type="submit">Cari</PrimaryButton></form>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No. Batch</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tgl Roasting</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Green Bean</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roast Level</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {roastBatches.data.map((batch) => (
                                            <tr key={batch.id} className={batch.deleted_at ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{batch.nomor_batch_roasting}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(batch.tanggal_roasting)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{batch.green_bean ? `${batch.green_bean.nama_kopi} (${batch.green_bean.lot_identifier})` : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{batch.roast_level}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{batch.nama_operator}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.deleted_at ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{batch.deleted_at ? 'Diarsipkan' : 'Aktif'}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    {batch.deleted_at ? (<>
                                                        <Link href={route('roast-batches.restore', batch.id)} method="post" as="button" type="button" className="text-sm text-green-600 hover:underline">Restore</Link>
                                                        <Link href={route('roast-batches.force-delete', batch.id)} method="delete" as="button" type="button" onBefore={() => confirm('HAPUS PERMANEN? Aksi ini tidak bisa dibatalkan!')} className="text-sm text-red-600 hover:underline">Hapus Permanen</Link>
                                                    </>) : (<>
                                                        <Link href={route('roast-batches.show', batch.id)}><SecondaryButton className="text-xs">Lihat</SecondaryButton></Link>
                                                        <Link href={route('roast-batches.edit', batch.id)}><PrimaryButton className="text-xs !bg-yellow-500 hover:!bg-yellow-600 focus:!ring-yellow-500">Edit</PrimaryButton></Link>
                                                        <Link href={route('roast-batches.destroy', batch.id)} method="delete" as="button" type="button" onBefore={() => confirm(`Arsipkan batch "${batch.nomor_batch_roasting}"? Stok green bean akan dikembalikan.`)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Arsipkan</Link>
                                                    </>)}
                                                </td>
                                            </tr>
                                        ))}
                                        {roastBatches.data.length === 0 && (<tr><td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6">
                                {roastBatches.links.length > 3 && ( <div className="flex flex-wrap -mb-1">{roastBatches.links.map((link, key) => ( link.url === null ? <div key={key} className="..." dangerouslySetInnerHTML={{ __html: link.label }} /> : <Link key={key} className={`... ${link.active ? 'bg-indigo-500 ...' : ''}`} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} /> ))}</div> )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ==== MODAL UNTUK PILIH KOLOM, MENGGANTIKAN DROPDOWN ==== */}
            <Modal show={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} maxWidth="2xl">
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-4 dark:border-gray-700">
                        Pilih Kolom untuk Diekspor
                    </h2>
                    <div className="mt-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <label className="flex items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer font-semibold">
                            <Checkbox ref={selectAllCheckboxRef} checked={isAllSelected} onChange={handleSelectAllChange} />
                            <span className="ms-2 text-gray-700 dark:text-gray-200">Pilih Semua / Hapus Semua</span>
                        </label>
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto p-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {allExportableColumns.map(col => (
                                <label key={col.key} className="flex items-center text-sm p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                    <Checkbox name="column" value={col.key} checked={selectedColumns[col.key]} onChange={() => handleColumnSelectionChange(col.key)} />
                                    <span className="ms-2 text-gray-600 dark:text-gray-400">{col.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <PrimaryButton onClick={() => setIsColumnModalOpen(false)}>
                            Tutup
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}