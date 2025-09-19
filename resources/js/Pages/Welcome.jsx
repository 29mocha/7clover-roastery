import { Head } from '@inertiajs/react';

// Catatan: Komponen <Link> dari Inertia.js diganti dengan tag <a> standar
// untuk mengatasi potensi error kompilasi di beberapa lingkungan.

export default function Welcome({ auth }) {
    // Tombol dengan kontras tinggi
    const buttonStyle = "inline-block px-10 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50";
    
    // Style untuk latar belakang dengan tekstur clover
    const texturedBackgroundStyle = {
        backgroundColor: '#556B2F', // Warna dasar hijau army
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='88' height='88' viewBox='0 0 88 88' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M33 88c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm22 0c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM55 22c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM33 22c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM88 55c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm0-22c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zM22 55c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm0-22c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z'/%3E%3C/g%3E%3C/svg%3E")`,
    };

    return (
        <>
            <Head>
                <title>Welcome - Roastery Management System</title>
                {/* Mengimpor font "Inter" dari Google Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            
            <div 
                className="min-h-screen flex flex-col md:flex-row" 
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                
                {/* Kolom Kiri: Sisi Logo dengan Latar Belakang Hitam */}
                <div className="w-full md:w-1/2 bg-black flex flex-grow items-center justify-center p-8 sm:p-12 order-1 md:order-1">
                    <img
                        src="/images/logo.png"
                        alt="7 Clover Roastery Logo"
                        className="h-64 sm:h-80 w-auto"
                    />
                </div>

                {/* Kolom Kanan: Sisi Konten dengan Latar Belakang Bertekstur */}
                <div 
                    className="w-full md:w-1/2 text-white flex flex-grow items-center justify-center p-8 sm:p-12 order-2 md:order-2"
                    style={texturedBackgroundStyle} // Menggunakan style object
                >
                    <div className="max-w-md w-full text-center md:text-left">
                        {/* Judul */}
                        <h1 className="text-4xl sm:text-5xl text-white font-medium leading-tight tracking-tight mb-4">
                            Roastery Management System.
                        </h1>
                        {/* Deskripsi */}
                        <p className="text-gray-200 text-lg sm:text-xl mb-10 leading-relaxed">
                            Manage inventory, track batches, and control costs—all in one place.
                        </p>
                        
                        {/* Tombol Aksi */}
                        <div className="flex justify-center md:justify-start">
                            {auth.user ? (
                                <a href="/dashboard" className={buttonStyle}>
                                    Go to Dashboard
                                </a>
                            ) : (
                                <a href="/login" className={buttonStyle}>
                                    Sign In
                                </a>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

