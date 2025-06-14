import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="min-h-screen bg-white text-gray-900 font-sans">
                {/* Sticky header */}
                <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
                    <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/images/logo.png"
                                alt="7 Clover Roastery Logo"
                                className="h-10 w-auto"
                            />
                            <span className="text-xl font-semibold tracking-tight select-none">
                                7 Clover Roastery
                            </span>
                        </div>
                        <nav className="space-x-6 text-gray-600 text-sm font-medium">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="hover:text-gray-900 transition duration-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hover:text-gray-900 transition duration-200"
                                    >
                                        Log in
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center text-center">
                    <div className="bg-white rounded-2xl shadow-md px-10 py-12 max-w-3xl w-full">
                        <img
                            src="/images/logo.png"
                            alt="7 Clover Roastery Logo"
                            className="mx-auto h-20 w-auto mb-8"
                        />
                        <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-6">
                            Selamat Datang di 7 Clover Roastery Inventory System
                        </h1>
                        <p className="text-gray-500 text-lg mb-8">
                            Silakan login atau register untuk mulai mengelola inventaris kopi Anda.
                        </p>
                        {!auth.user && (
                            <div className="flex justify-center space-x-6">
                                <Link
                                    href={route('login')}
                                    className="px-8 py-3 border border-gray-900 rounded-md font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition duration-200"
                                >
                                    Log in
                                </Link>
                            </div>
                        )}
                        {auth.user && (
                            <Link
                                href={route('dashboard')}
                                className="inline-block mt-2 px-10 py-4 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-700 transition duration-200"
                            >
                                Go to Dashboard
                            </Link>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

