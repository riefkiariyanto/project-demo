import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    BanknotesIcon, ShoppingBagIcon, BuildingStorefrontIcon,
    UserGroupIcon,
} from "@heroicons/react/24/solid";

function formatRp(v) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);
}

export default function SuperAdminDashboard({
    stores = [],
    totalHariIni = 0,
    totalBulanIni = 0,
    totalPesanan = 0,
    tanggal = "",
    greeting = "Selamat Datang",
}) {
    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Dashboard Superadmin" />
            <div className="flex flex-col gap-4 p-4 h-full overflow-auto no-scrollbar">

                {/* HEADER */}
                <div className="bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-5 shadow-lg">
                    <p className="text-white/60 text-sm">{greeting} — {tanggal}</p>
                    <h1 className="text-2xl font-bold text-white mt-0.5">Overview Semua Toko</h1>
                </div>

                {/* GLOBAL SUMMARY */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: BanknotesIcon,         label: "Omzet Hari Ini",   value: formatRp(totalHariIni) },
                        { icon: ShoppingBagIcon,       label: "Pesanan Hari Ini", value: totalPesanan },
                        { icon: BanknotesIcon,         label: "Omzet Bulan Ini",  value: formatRp(totalBulanIni) },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-4 shadow-lg space-y-2">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <s.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-white/60 text-xs">{s.label}</p>
                            <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* PER-STORE CARDS */}
                <div className="space-y-3">
                    <h2 className="font-bold text-white text-sm px-1">Performa per Toko — Hari Ini</h2>
                    {stores.map((store) => (
                        <div key={store.id}
                            className="bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-4 shadow-lg space-y-3">
                            {/* Store header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                                    {store.logo
                                        ? <img src={`/storage/${store.logo}`} alt={store.name} className="w-full h-full object-cover" />
                                        : <BuildingStorefrontIcon className="w-5 h-5 text-white/60" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">{store.name}</p>
                                    <div className="flex items-center gap-1 text-white/50 text-xs">
                                        <UserGroupIcon className="w-3 h-3" />
                                        {store.user_count} pengguna
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-white font-bold">{formatRp(store.pendapatan)}</p>
                                    <p className="text-white/50 text-xs">{store.pesanan} pesanan</p>
                                </div>
                            </div>

                            {/* Progress bar omzet bulan ini */}
                            <div>
                                <div className="flex justify-between text-xs text-white/50 mb-1">
                                    <span>Omzet bulan ini</span>
                                    <span>{formatRp(store.bulan_ini)}</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: totalBulanIni > 0 ? `${Math.min((store.bulan_ini / totalBulanIni) * 100, 100)}%` : "0%" }}
                                    />
                                </div>
                                <p className="text-xs text-white/40 mt-1">
                                    {totalBulanIni > 0 ? Math.round((store.bulan_ini / totalBulanIni) * 100) : 0}% dari total omzet
                                </p>
                            </div>
                        </div>
                    ))}

                    {stores.length === 0 && (
                        <div className="bg-white/10 rounded-2xl p-8 text-center text-white/40">
                            Belum ada toko terdaftar
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
