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
                <div className="bg-orange-500 rounded-2xl p-5 shadow-lg">
                    <p className="text-orange-100 text-sm">{greeting} — {tanggal}</p>
                    <h1 className="text-2xl font-bold text-white mt-0.5">Overview Semua Toko</h1>
                </div>

                {/* GLOBAL SUMMARY */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: BanknotesIcon,   label: "Omzet Hari Ini",   value: formatRp(totalHariIni) },
                        { icon: ShoppingBagIcon, label: "Pesanan Hari Ini", value: totalPesanan },
                        { icon: BanknotesIcon,   label: "Omzet Bulan Ini",  value: formatRp(totalBulanIni) },
                    ].map((s, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-2">
                            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                <s.icon className="w-5 h-5 text-orange-500" />
                            </div>
                            <p className="text-gray-500 dark:text-slate-400 text-xs">{s.label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* PER-STORE CARDS */}
                <div className="space-y-3">
                    <h2 className="font-bold text-gray-900 dark:text-white text-sm px-1">Performa per Toko — Hari Ini</h2>
                    {stores.map((store) => (
                        <div key={store.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
                            {/* Store header */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    {store.logo
                                        ? <img src={`/storage/${store.logo}`} alt={store.name} className="w-full h-full object-cover" />
                                        : <BuildingStorefrontIcon className="w-5 h-5 text-orange-500 dark:text-slate-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">{store.name}</p>
                                    <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500 text-xs">
                                        <UserGroupIcon className="w-3 h-3" />
                                        {store.user_count} pengguna
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-orange-500 font-bold">{formatRp(store.pendapatan)}</p>
                                    <p className="text-gray-400 dark:text-slate-500 text-xs">{store.pesanan} pesanan</p>
                                </div>
                            </div>

                            {/* Progress bar omzet bulan ini */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mb-1">
                                    <span>Omzet bulan ini</span>
                                    <span>{formatRp(store.bulan_ini)}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: totalBulanIni > 0 ? `${Math.min((store.bulan_ini / totalBulanIni) * 100, 100)}%` : "0%" }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                    {totalBulanIni > 0 ? Math.round((store.bulan_ini / totalBulanIni) * 100) : 0}% dari total omzet
                                </p>
                            </div>
                        </div>
                    ))}

                    {stores.length === 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center text-gray-400 dark:text-slate-500">
                            Belum ada toko terdaftar
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
