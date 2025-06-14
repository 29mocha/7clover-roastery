import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Index({ auth, packagedProducts, flash, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    // --- Logika untuk Pemilihan Kolom Ekspor ---
    const allExportableColumns = useMemo(() => [
        { key: 'id', label: 'ID Produk Jadi' },
        { key: 'nama_produk', label: 'Nama Produk' },
        { key: 'tanggal_kemas', label: 'Tanggal Kemas' },
        { key: 'berat_bersih_g', label: 'Berat Bersih (g)' },
        { key: 'kuantitas_tersisa', label: 'Stok Tersisa (pcs)' },
        { key: 'total_hpp_per_kemasan', label: 'HPP per Kemasan (Rp)' },
        { key: 'saran_harga_jual', label: 'Saran Harga Jual (Rp)' },
        { key: 'asal_batch', label: 'Asal Batch Roasting' },
        { key: 'asal_kopi', label: 'Asal Green Bean' },
        { key: 'catatan', label: 'Catatan' },
    ], []);

    const [selectedColumns, setSelectedColumns] = useState(() => {
        const initialCols = {};
        const defaultKeys = ['nama_produk', 'tanggal_kemas', 'kuantitas_tersisa', 'total_hpp_per_kemasan', 'asal_batch'];
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
        const url = new URL(route('packaged-products.export'));
        if (filters.search) { url.searchParams.append('search', filters.search); }
        Object.keys(selectedColumns).forEach(key => { if (selectedColumns[key]) { url.searchParams.append('columns[]', key); } });
        return url.href;
    }, [filters, selectedColumns]);
    // --- Akhir Logika ---

    const handleSearch = (e) => { e.preventDefault(); router.get(route('packaged-products.index'), { search: searchTerm }, { preserveState: true, replace: true }); };
    useEffect(() => { setSearchTerm(filters.search || ''); }, [filters]);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <AuthenticatedLayout auth={auth} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Inventaris Produk Jadi</h2>}>
            <Head title="Inventaris Produk Jadi" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            {flash && flash.success && (<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow">{flash.success}</div>)}
                            {flash && flash.error && (<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow">{flash.error}</div>)}

                            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <form onSubmit={handleSearch} className="flex items-center gap-2">
                                    <TextInput type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama produk atau kopi..." className="w-full md:w-auto" />
                                    <PrimaryButton type="submit">Cari</PrimaryButton>
                                </form>
                                <div className="flex items-center gap-2">
                                    <Link href={route('packaging.create')}><PrimaryButton>+ Proses Pengemasan</PrimaryButton></Link>
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
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Produk</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tgl Kemas</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok (pcs)</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">HPP / pcs</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asal Kopi</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {packagedProducts.data.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{product.nama_produk}</div><div className="text-xs text-gray-500 dark:text-gray-400">{product.berat_bersih_g} gram</div></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(product.tanggal_kemas)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 text-right"><span className="font-semibold">{product.kuantitas_tersisa}</span><span className="text-xs text-gray-500"> / {product.kuantitas_awal}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{formatCurrency(product.total_hpp_per_kemasan)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.roasted_bean?.roast_batch?.green_bean?.nama_kopi || 'N/A'}<div className="text-xs text-gray-400">Batch: <Link href={route('roast-batches.show', product.roasted_bean?.roast_batch?.id)} className="text-indigo-600 hover:underline">{product.roasted_bean?.roast_batch?.nomor_batch_roasting || ''}</Link>{product.roasted_bean?.roast_batch?.deleted_at && <span className="ml-2 text-red-500">(Diarsipkan)</span>}</div></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium"><Link href={route('packaged-products.show', product.id)}><SecondaryButton className="text-xs">Lihat</SecondaryButton></Link></td>
                                            </tr>
                                        ))}
                                        {packagedProducts.data.length === 0 && (<tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Belum ada produk jadi yang dikemas.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="mt-6">
                                {packagedProducts.links.length > 3 && (
                                    <div className="flex flex-wrap -mb-1">
                                        {packagedProducts.links.map((link, key) => (
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
                    <div className="mt-4 border-b border-gray-200 dark:border-gray-700 pb-2"><label className="flex items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer font-semibold"><Checkbox ref={selectAllCheckboxRef} checked={isAllSelected} onChange={handleSelectAllChange} /><span className="ms-2 text-gray-700 dark:text-gray-200">Pilih Semua / Hapus Semua</span></label></div>
                    <div className="mt-2 max-h-72 overflow-y-auto p-2"><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{allExportableColumns.map(col => (
                        <label key={col.key} className="flex items-center text-sm p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"><Checkbox name="column" value={col.key} checked={selectedColumns[col.key]} onChange={() => handleColumnSelectionChange(col.key)} /><span className="ms-2 text-gray-600 dark:text-gray-400">{col.label}</span></label>
                    ))}</div></div>
                    <div className="mt-6 flex justify-end"><PrimaryButton onClick={() => setIsColumnModalOpen(false)}>Tutup</PrimaryButton></div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}