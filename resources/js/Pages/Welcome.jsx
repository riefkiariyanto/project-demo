import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }) {

    const getDashboardLink = () => {
<<<<<<< HEAD
        if (auth.roles.includes("superadmin")) return "/superadmin";
<<<<<<< HEAD
        if (auth.roles.includes("admin")) return "/admindashboard";
=======
        if (auth.roles.includes("admin")) return "/admin";
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
        if (auth.roles?.includes("superadmin")) return "/superadmin";
        if (auth.roles?.includes("admin")) return "/admin";
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
        return "/dashboard";
    };

    return (
        <>
            <Head title="WERP" />

            <div className="relative min-h-screen overflow-hidden bg-black">

                {/* ANIMATED BACKGROUND */}
                <div className="absolute inset-0">

                    {/* Gradient blobs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/30 rounded-full blur-3xl animate-pulse"></div>

                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>

                    <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-orange-300/20 rounded-full blur-3xl animate-bounce"></div>

                    {/* Grid effect */}
                    <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    ></div>

                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent"></div>
                </div>

                {/* NAVBAR */}
                <nav className="relative z-20 flex items-center justify-between px-6 py-6 lg:px-16">

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg"></div>

                        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-widest">
                            WERP
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">

                        {auth.user ? (
                            <Link
                                href={getDashboardLink()}
                                className="px-6 py-2.5 rounded-full bg-white text-white font-semibold hover:scale-105 transition-all duration-300 shadow-2xl"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="hidden sm:flex px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-all duration-300"
                                >
                                    Login
                                </Link>

                                <Link
                                    href={route("register")}
                                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-300 to-orange-500 text-white font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,215,0,0.35)]"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}

                    </div>
                </nav>

                {/* HERO */}
                <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[85vh]">

                    {/* Badge */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-400/20 bg-orange-400/10 backdrop-blur-xl text-orange-300 text-sm font-medium shadow-xl">
                            ✨ ERP Modern Untuk UMKM Indonesia
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight text-white">

                        Kelola Bisnis Lebih
                        <span className="block bg-gradient-to-r from-orange-300 via-orange-400 to-orange-400 bg-clip-text text-transparent">
                            Cepat & Modern
                        </span>

                    </h1>

                    {/* Subtext */}
                    <p className="mt-8 max-w-2xl text-lg lg:text-2xl text-white/70 leading-relaxed">
                        <span className="font-bold text-white">
                            WERP
                        </span>{" "}
                        mempermudah pencacatan, kasir, stok, dan laporan UMKM mu
                        dalam satu platform modern.
                    </p>

                    {/* CTA */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">

                        <Link
                            href={route("register")}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-300 to-orange-500 text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,215,0,0.35)]"
                        >
                            Mulai Gratis
                        </Link>

                        <Link
                            href={route("login")}
                            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                        >
                            Login Dashboard
                        </Link>

                    </div>

                    {/* MOCKUP */}
                    <div className="relative mt-20 w-full max-w-6xl">

                        {/* Glow */}
                        <div className="absolute inset-0 bg-orange-400/20 blur-3xl rounded-full"></div>

                        {/* Dashboard mockup */}
                        <div className="relative rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">

                            {/* Top bar */}
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>

<<<<<<< HEAD
                        <main className="mt-6">
<<<<<<< HEAD

                        </main>

=======
                            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                                <a
                                    href="https://laravel.com/docs"
                                    id="docs-card"
                                    className="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] md:row-span-3 lg:p-10 lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"
                                >
                                    <div
                                        id="screenshot-container"
                                        className="relative flex w-full flex-1 items-stretch"
                                    >
                                        <img
                                            src="https://laravel.com/assets/img/welcome/docs-light.svg"
                                            alt="Laravel documentation screenshot"
                                            className="aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.06)] dark:hidden"
                                            onError={handleImageError}
                                        />
                                        <img
                                            src="https://laravel.com/assets/img/welcome/docs-dark.svg"
                                            alt="Laravel documentation screenshot"
                                            className="hidden aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.25)] dark:block"
                                        />
                                        <div className="absolute -bottom-16 -left-16 h-40 w-[calc(100%+8rem)] bg-gradient-to-b from-transparent via-white to-white dark:via-zinc-900 dark:to-zinc-900"></div>
                                    </div>
=======
                            {/* Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab

                                {/* LEFT */}
                                <div className="lg:col-span-2 space-y-6">

                                    <div className="grid grid-cols-2 gap-4">

                                        <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                                            <p className="text-white/60 text-sm">
                                                Total Penjualan
                                            </p>

                                            <h2 className="mt-2 text-3xl font-black text-white">
                                                Rp 12.4JT
                                            </h2>

                                            <p className="mt-2 text-green-400 text-sm">
                                                +18% bulan ini
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                                            <p className="text-white/60 text-sm">
                                                Produk Terjual
                                            </p>

                                            <h2 className="mt-2 text-3xl font-black text-white">
                                                1.284
                                            </h2>

                                            <p className="mt-2 text-orange-300 text-sm">
                                                Real-time update
                                            </p>
                                        </div>

                                    </div>

                                    <div className="h-64 rounded-3xl bg-gradient-to-br from-orange-400/10 to-orange-500/10 border border-white/10 flex items-end p-6">

                                        <div className="flex items-end gap-3 w-full h-full">

                                            <div className="w-full bg-orange-300 rounded-t-xl h-[40%] animate-pulse"></div>

                                            <div className="w-full bg-orange-400 rounded-t-xl h-[70%]"></div>

                                            <div className="w-full bg-orange-400 rounded-t-xl h-[55%]"></div>

                                            <div className="w-full bg-orange-500 rounded-t-xl h-[85%]"></div>

                                            <div className="w-full bg-orange-300 rounded-t-xl h-[65%]"></div>

                                        </div>

                                    </div>

                                </div>

<<<<<<< HEAD
                        <footer className="py-16 text-center text-sm text-black dark:text-white/70">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </footer>
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
                                {/* RIGHT */}
                                <div className="space-y-4">

                                    <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                                        <p className="text-white font-semibold">
                                            Aktivitas Hari Ini
                                        </p>

                                        <div className="mt-4 space-y-3">

                                            <div className="flex items-center justify-between">
                                                <span className="text-white/60">
                                                    Transaksi
                                                </span>

                                                <span className="text-white font-bold">
                                                    124
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-white/60">
                                                    Produk
                                                </span>

                                                <span className="text-white font-bold">
                                                    83
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-white/60">
                                                    Stok Menipis
                                                </span>

                                                <span className="text-red-400 font-bold">
                                                    5
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 p-5 text-white">
                                        <p className="font-bold text-lg">
                                            Siap Digitalisasi UMKM?
                                        </p>

                                        <p className="mt-2 text-white/70">
                                            Gunakan WERP untuk mengelola bisnis
                                            lebih modern dan efisien.
                                        </p>

                                        <Link
                                            href={route("register")}
                                            className="mt-5 inline-flex px-5 py-2 rounded-xl bg-black text-orange-300 font-semibold"
                                        >
                                            Mulai Sekarang
                                        </Link>
                                    </div>

                                </div>

                            </div>

                        </div>

>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                    </div>

                </section>

                {/* Footer */}
                <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 dark:border-slate-800">
                    <p className="mb-1">© {new Date().getFullYear()} WERP — Warung & Resto Point of Sale</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/privacy" className="hover:text-orange-500 transition">Kebijakan Privasi</Link>
                        <Link href="/tos" className="hover:text-orange-500 transition">Syarat & Ketentuan</Link>
                    </div>
                </footer>

            </div>
        </>
    );
}