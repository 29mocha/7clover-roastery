import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Index({ auth, roastedBeans, flash, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    // --- Logika untuk Pemilihan Kolom Ekspor ---
    const allExportableColumns = useMemo(() => [
        { key: 'id', label: 'ID Item' },
        { key: 'nama_produk_sangrai', label: 'Nama Produk' },
        { key: 'tanggal_roasting', label: 'Tgl Roasting' },
        { key: 'roast_level', label: 'Roast Level' },
        { key: 'stok_awal_g', label: 'Stok Awal (g)' },
        { key: 'stok_tersisa_g', label: 'Stok Tersisa (g)' },
        { key: 'catatan_item', label: 'Catatan' },
        { key: 'nomor_batch_roasting', label: 'No. Batch Asal' },
        { key: 'green_bean_name', label: 'Green Bean Asal' },
        { key: 'created_at', label: 'Dibuat Pada' },
        { key: 'updated_at', label: 'Diupdate Pada' },
    ], []);

    const [selectedColumns, setSelectedColumns] = useState(() => {
        const initialCols = {};
        const defaultKeys = ['nama_produk_sangrai', 'tanggal_roasting', 'nomor_batch_roasting', 'roast_level', 'stok_tersisa_g'];
        allExportableColumns.forEach(col => { initialCols[col.key] = defaultKeys.includes(col.key); });
        return initialCols;
    });

    const handleColumnSelectionChange = (key) => {
        setSelectedColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const selectAllCheckboxRef = useRef();
    const selectedCount = Object.values(selectedColumns).filter(Boolean).length;
    const isAllSelected = selectedCount === allExportableColumns.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < allExportableColumns.length;

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handleSelectAllChange = (e) => {
        const newSelectedColumns = {};
        allExportableColumns.forEach(col => {
            newSelectedColumns[col.key] = e.target.checked;
        });
        setSelectedColumns(newSelectedColumns);
    };

    const exportUrl = useMemo(() => {
        const url = new URL(route('roasted-beans.export'));
        if (filters.search) { url.searchParams.append('search', filters.search); }
        Object.keys(selectedColumns).forEach(key => {
            if (selectedColumns[key]) { url.searchParams.append('columns[]', key); }
        });
        return url.href;
    }, [filters, selectedColumns]);
    // --- Akhir Logika ---

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('roasted-beans.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Inventaris Roasted Beans</h2>}
        >
            <Head title="Inventaris Roasted Beans" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            {flash.success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">{flash.success}</div>)}
                            {flash.error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">{flash.error}</div>)}

                            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <form onSubmit={handleSearch} className="flex items-center gap-2">
                                    <TextInput type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama produk, batch..." className="w-full md:w-auto" />
                                    <PrimaryButton type="submit">Cari</PrimaryButton>
                                </form>
                                <div className="flex items-center gap-2">
                                    <a href={exportUrl}><SecondaryButton>Export</SecondaryButton></a>
                                    <SecondaryButton className="px-2" onClick={() => setIsColumnModalOpen(true)}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    </SecondaryButton>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Produk Sangrai</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tgl Roasting</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asal Batch</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok Tersisa (g)</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {roastedBeans.data.map((rb) => (
                                            <tr key={rb.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rb.nama_produk_sangrai}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(rb.tanggal_roasting)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {rb.roast_batch ? (<Link href={route('roast-batches.show', rb.roast_batch.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">{rb.roast_batch.nomor_batch_roasting}</Link>) : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200 text-right">{rb.stok_tersisa_g.toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Link href={route('roasted-beans.show', rb.id)}><SecondaryButton className="text-xs">Lihat</SecondaryButton></Link>
                                                    <Link href={route('roasted-beans.edit', rb.id)}><PrimaryButton className="text-xs !bg-yellow-500 hover:!bg-yellow-600 focus:!ring-yellow-500">Edit Stok</PrimaryButton></Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {roastedBeans.data.length === 0 && (
                                            <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Tidak ada data roasted bean yang cocok dengan filter.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                {roastedBeans.links.length > 3 && (
                                    <div className="flex flex-wrap -mb-1">
                                        {roastedBeans.links.map((link, key) => (
                                            link.url === null ?
                                                <div key={key} className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded dark:border-gray-600" dangerouslySetInnerHTML={{ __html: link.label }} /> :
                                                <Link key={key} className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 ${link.active ? 'bg-indigo-500 text-white dark:bg-indigo-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isColumnModalOpen} onClose={() => setIsColumnModalOpen(false)} maxWidth="2xl">
                <div className="p-6 dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-4 dark:border-gray-700">Pilih Kolom untuk Diekspor</h2>
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
                        <PrimaryButton onClick={() => setIsColumnModalOpen(false)}>Tutup</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}