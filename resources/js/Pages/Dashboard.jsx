import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import {
    ShoppingCartIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from "@heroicons/react/24/solid";

function StatCard({ icon: Icon, label, value, growth, color = "orange" }) {
    const isUp = growth >= 0;
    const colorMap = {
        orange: "from-orange-400 to-orange-500",
        green:  "from-green-400 to-green-500",
        blue:   "from-blue-400 to-blue-500",
    };
    return (
        <div className="bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-5 shadow-lg flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-xs text-white/60 dark:text-white/50">{label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{value}</p>
            </div>
            {growth !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-green-300" : "text-red-300"}`}>
                    {isUp ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                    {isUp ? "+" : ""}{growth}% vs kemarin
                </div>
            )}
        </div>
    );
}

function formatRp(v) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);
}

export default function Dashboard({ stats = {}, lowStock = [], recentSales = [], greeting = "Selamat Datang" }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-4 p-4 h-full overflow-auto no-scrollbar">

                {/* GREETING */}
                <div className="bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-5 shadow-lg">
                    <p className="text-white/70 text-sm">{greeting},</p>
                    <h1 className="text-2xl font-bold text-white">{auth.user.name} 👋</h1>
                    <p className="text-white/60 text-xs mt-1">Kasir · {auth.store?.name ?? "—"}</p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={BanknotesIcon}
                        label="Pendapatan Hari Ini"
                        value={formatRp(stats.pendapatan)}
                        growth={stats.growth}
                        color="orange"
                    />
                    <StatCard
                        icon={ShoppingBagIcon}
                        label="Pesanan Hari Ini"
                        value={stats.pesanan ?? 0}
                        color="blue"
                    />
                </div>

                {/* SHORTCUT KASIR */}
                <Link href="/kasir"
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white text-orange-500 font-bold text-lg shadow-lg hover:bg-orange-50 transition active:scale-95">
                    <ShoppingCartIcon className="w-6 h-6" />
                    Buka Kasir
                </Link>

                {/* TRANSAKSI TERBARU HARI INI */}
                {recentSales.length > 0 && (
                    <div className="bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 p-4 shadow-lg space-y-3">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-white/70" />
                            <h2 className="font-bold text-white text-sm">Transaksi Hari Ini</h2>
                        </div>
                        {recentSales.map((sale, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                                <div>
                                    <p className="text-white font-semibold text-sm">{sale.invoice_no}</p>
                                    <p className="text-white/50 text-xs">{sale.items_count} item · {sale.sale_date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">{formatRp(sale.grand_total)}</p>
                                    <p className="text-white/50 text-xs">{sale.payment_method}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* STOK MENIPIS */}
                {lowStock.length > 0 && (
                    <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-400/30 p-4 shadow-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-300" />
                            <h2 className="font-bold text-white text-sm">Stok Menipis</h2>
                        </div>
                        {lowStock.map((p, i) => (
                            <div key={i} className="flex justify-between items-center py-1.5 border-b border-red-400/20 last:border-0">
                                <p className="text-white text-sm">{p.name}</p>
                                <span className="text-xs px-2 py-0.5 rounded-lg bg-red-500/40 text-red-100 font-semibold">
                                    {p.stock} {p.unit}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
