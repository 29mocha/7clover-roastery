import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import Dropdown from '@/Components/Dropdown';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Index({ auth, greenBeans, flash, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    // --- Logika untuk Pemilihan Kolom Ekspor ---
    const allExportableColumns = useMemo(() => [
        { key: 'id', label: 'ID' }, { key: 'nama_kopi', label: 'Nama Kopi' },
        { key: 'lot_identifier', label: 'Lot Identifier' }, { key: 'tanggal_terima', label: 'Tanggal Terima' },
        { key: 'origin', label: 'Origin' }, { key: 'varietas', label: 'Varietas' },
        { key: 'processing_method', label: 'Metode Proses' }, { key: 'processor', label: 'Processor' },
        { key: 'altitude', label: 'Altitude' }, { key: 'supplier', label: 'Supplier' },
        { key: 'harga_beli_per_kg', label: 'Harga Beli (per kg)' }, { key: 'jumlah_awal_g', label: 'Jumlah Awal (g)' },
        { key: 'stok_saat_ini_g', label: 'Stok Saat Ini (g)' },
        { key: 'stock_value', label: 'Nilai Stok (Rp)' }, // <-- OPSI BARU DITAMBAHKAN DI SINI
        { key: 'tasting_notes', label: 'Tasting Notes' }, { key: 'catatan', label: 'Catatan' },
        { key: 'created_at', label: 'Dibuat Pada' }, { key: 'updated_at', label: 'Diupdate Pada' },
    ], []);

    const [selectedColumns, setSelectedColumns] = useState(() => {
        const initialCols = {};
        const defaultKeys = ['nama_kopi', 'lot_identifier', 'origin', 'stok_saat_ini_g', 'stock_value', 'tanggal_terima'];
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
        const url = new URL(route('green-beans.export'));
        if (filters.search) { url.searchParams.append('search', filters.search); }
        Object.keys(selectedColumns).forEach(key => {
            if (selectedColumns[key]) { url.searchParams.append('columns[]', key); }
        });
        return url.href;
    }, [filters, selectedColumns]);
    // --- Akhir Logika Pemilihan Kolom ---

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('green-beans.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    useEffect(() => { setSearchTerm(filters.search || ''); }, [filters]);
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Green Beans</h2>}
        >
            <Head title="Green Beans" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            {flash.success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">{flash.success}</div>)}
                            {flash.error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">{flash.error}</div>)}

                            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <form onSubmit={handleSearch} className="flex items-center gap-2">
                                    <TextInput type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama, lot, atau origin..." className="w-full md:w-auto" />
                                    <PrimaryButton type="submit">Cari</PrimaryButton>
                                </form>
                                <div className="flex items-center gap-2">
                                    <Link href={route('green-beans.create')}><PrimaryButton>Tambah Green Bean</PrimaryButton></Link>
                                    <div className="flex items-center gap-2">
                                        <a href={exportUrl}><SecondaryButton>Export</SecondaryButton></a>
                                        <SecondaryButton className="px-2" onClick={() => setIsColumnModalOpen(true)}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </SecondaryButton>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kopi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lot ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Origin</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok (g)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tgl Terima</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {greenBeans.data.map((bean) => (
                                            <tr key={bean.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{bean.nama_kopi}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{bean.lot_identifier}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{bean.origin}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{bean.stok_saat_ini_g.toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(bean.tanggal_terima)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Link href={route('green-beans.show', bean.id)}><SecondaryButton className="text-xs">Lihat</SecondaryButton></Link>
                                                    <Link href={route('green-beans.edit', bean.id)}><PrimaryButton className="text-xs !bg-yellow-500 hover:!bg-yellow-600 focus:!ring-yellow-500">Edit</PrimaryButton></Link>
                                                    <Link href={route('green-beans.destroy', bean.id)} method="delete" as="button" type="button" onBefore={() => confirm(`Yakin ingin menghapus "${bean.nama_kopi}"?`)} preserveScroll className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Hapus</Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {greenBeans.data.length === 0 && (
                                            <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Tidak ada data green bean yang cocok dengan filter.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                {greenBeans.links.length > 3 && (
                                    <div className="flex flex-wrap -mb-1">
                                        {greenBeans.links.map((link, key) => (
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-4 dark:border-gray-700">
                        Pilih Kolom untuk Diekspor
                    </h2>
                    
                    <div className="mt-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <label className="flex items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer font-semibold">
                            <Checkbox
                                ref={selectAllCheckboxRef}
                                checked={isAllSelected}
                                onChange={handleSelectAllChange}
                            />
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