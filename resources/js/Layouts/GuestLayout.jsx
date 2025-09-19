import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        // ==== PERUBAHAN DI SINI: Padding atas ditambah secara signifikan untuk menurunkan posisi ====
        <div className="min-h-screen flex flex-col items-center pt-20 bg-gray-100 dark:bg-gray-900">
            <div>
                <Link href="/">
                    {/* ==== PERUBAHAN DI SINI: Ukuran diperbesar menjadi w-48 h-48 ==== */}
                    <ApplicationLogo className="w-48 h-48 fill-current text-gray-500" />
                </Link>
            </div>

            {/* Margin atas tetap kecil agar logo dekat dengan form */}
            <div className="w-full sm:max-w-md mt-4 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}

