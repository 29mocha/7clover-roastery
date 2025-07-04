import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ auth, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark-container">
            <nav className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</NavLink>
                                <NavLink href={route('green-beans.index')} active={route().current().startsWith('green-beans')}>Green Beans</NavLink>
                                <NavLink href={route('roast-batches.index')} active={route().current().startsWith('roast-batches')}>Roast Batches</NavLink>
                                <NavLink href={route('roasted-beans.index')} active={route().current().startsWith('roasted-beans')}>Roasted Beans</NavLink>
                                <NavLink href={route('packaging.create')} active={route().current('packaging.create')}>Pengemasan</NavLink>
                                <NavLink href={route('packaged-products.index')} active={route().current().startsWith('packaged-products')}>Produk Jadi</NavLink>
                                <NavLink href={route('reports.green-bean-usage')} active={route().current().startsWith('reports')}>Laporan</NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            {/* Menu Pengaturan */}
                            {auth.can.manage_app && (
                                <div className="ms-3 relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150">
                                                    Pengaturan
                                                    <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('users.index')}>Manajemen User</Dropdown.Link>
                                            <Dropdown.Link href={route('operational-costs.index')}>Biaya Operasional</Dropdown.Link>
                                            <Dropdown.Link href={route('packaging-items.index')}>Inventaris Kemasan</Dropdown.Link>
                                            <Dropdown.Link href={route('settings.index')}>Pengaturan Umum</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            )}

                            {/* Dropdown Profil Pengguna */}
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        {/* ==== PERBAIKAN DI SINI: <button> dibungkus kembali dengan <span> ==== */}
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {auth.user.name}
                                                <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger Menu */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button onClick={() => setShowingNavigationDropdown((previousState) => !previousState)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Responsive Navigation Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('green-beans.index')} active={route().current().startsWith('green-beans')}>Green Beans</ResponsiveNavLink>
                        {/* ... tambahkan semua NavLink lainnya di sini ... */}
                        <ResponsiveNavLink href={route('roast-batches.index')} active={route().current().startsWith('roast-batches')}>Roast Batches</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('roasted-beans.index')} active={route().current().startsWith('roasted-beans')}>Roasted Beans</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('packaging.create')} active={route().current('packaging.create')}>Pengemasan</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('packaged-products.index')} active={route().current().startsWith('packaged-products')}>Produk Jadi</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('reports.green-bean-usage')} active={route().current().startsWith('reports')}>Laporan</ResponsiveNavLink>
                        {auth.can.manage_app && (<>
                            <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                            <div className="px-4 text-xs text-gray-400">Pengaturan</div>
                            <ResponsiveNavLink href={route('operational-costs.index')} active={route().current().startsWith('operational-costs')}>Biaya Operasional</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('packaging-items.index')} active={route().current().startsWith('packaging-items')}>Inventaris Kemasan</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('settings.index')} active={route().current().startsWith('settings')}>Pengaturan Umum</ResponsiveNavLink>
                        </>)}
                    </div>
                    <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
                        <div className="px-4">
                            {/* ==== PERBAIKAN DI SINI ==== */}
                            <div className="font-medium text-base text-gray-800 dark:text-gray-200">{auth.user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{auth.user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}