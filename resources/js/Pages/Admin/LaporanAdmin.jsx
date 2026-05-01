import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useRef, useEffect, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
    PrinterIcon, XMarkIcon, ChevronRightIcon,
    BanknotesIcon, ShoppingCartIcon, CubeIcon,
} from "@heroicons/react/24/solid";


// ─── Format helpers ───────────────────────────────────────────────────────────
const formatRp = (v) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);

const formatRpShort = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return `${v}`;
};

// ─── Nota Print Modal ─────────────────────────────────────────────────────────
function NotaModal({ sale, onClose }) {
    const printRef = useRef();

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open("", "_blank", "width=400,height=600");
        win.document.write(`
            <html><head><title>Nota ${sale.invoice_no}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; font-size: 12px; padding: 16px; color: #000; }
                .divider { border-top: 1px dashed #000; margin: 8px 0; }
                .row { display: flex; justify-content: space-between; margin: 3px 0; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .big { font-size: 16px; }
            </style>
            </head><body>${content}</body></html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-orange-500 text-white">
                    <h3 className="font-bold">Nota Transaksi</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint}
                            className="flex items-center gap-1.5 bg-white text-orange-500 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-50 transition">
                            <PrinterIcon className="w-4 h-4" /> Print
                        </button>
                        <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Nota Content */}
                <div ref={printRef} className="p-5 font-mono text-sm text-black">
                    <div className="center bold big mb-1">WARKOP POS</div>
                    <div className="center text-xs text-gray-500 mb-3">Nota Pembelian</div>
                    <div className="divider" style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

                    <div className="row">
                        <span>No. Invoice</span>
                        <span className="bold">{sale.invoice_no}</span>
                    </div>
                    <div className="row">
                        <span>Tanggal</span>
                        <span>{sale.sale_date}</span>
                    </div>
                    <div className="row">
                        <span>Pembayaran</span>
                        <span>{sale.payment_method}</span>
                    </div>

                    <div className="divider" style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

                    {/* Items */}
                    {sale.items?.map((item, i) => (
                        <div key={i} className="mb-1">
                            <div className="bold">{item.name}</div>
                            <div className="row text-xs">
                                <span>{item.qty}x {formatRp(item.price)}</span>
                                <span>{formatRp(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}

                    <div className="divider" style={{ borderTop: "1px dashed #ccc", margin: "8px 0" }} />

                    <div className="row bold">
                        <span>TOTAL</span>
                        <span>{formatRp(sale.grand_total)}</span>
                    </div>

                    <div className="center mt-4 text-xs text-gray-400">
                        Terima kasih sudah berkunjung! 🙏
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ title, value, growth, icon: Icon, color }) {
    const isPositive = growth >= 0;
    return (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm text-white/70">{title}</h3>
                <div className={`p-2 rounded-xl ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
            <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className={`font-semibold text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? "+" : ""}{growth}%
                </span>
            </div>
            <p className="text-xs text-white/40 mt-1">vs bulan lalu</p>
        </div>
    );
}

// ─── Chart Penjualan ──────────────────────────────────────────────────────────
function ChartPenjualan({ chartData }) {
    const [minggu, setMinggu] = useState(1);

    const weeks = [1, 2, 3, 4];

    // Group by week
    const weeklyData = useMemo(() => {
        const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const result = days.map(d => ({ day: d, value: 0 }));

        chartData.forEach(row => {
            const date = new Date(row.date);
            const weekNum = Math.ceil(date.getDate() / 7);
            if (weekNum === minggu) {
                const dayIdx = date.getDay();
                result[dayIdx].value += row.total;
            }
        });

        // Reorder to Mon-Sun
        return [...result.slice(1), result[0]];
    }, [chartData, minggu]);

    return (
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 border border-white/20 rounded-2xl p-5 h-[320px] text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Analisa Penjualan</h3>
                <div className="flex gap-1">
                    {weeks.map(w => (
                        <button key={w} onClick={() => setMinggu(w)}
                            className={`text-xs px-3 py-1.5 rounded-full transition border border-white/20
                                ${minggu === w ? "bg-white text-orange-600 font-semibold" : "bg-white/10 hover:bg-white/20"}`}>
                            M{w}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="#ffffff" fontSize={12} />
                        <YAxis stroke="#ffffff" fontSize={11} tickFormatter={formatRpShort} />
                        <Tooltip
                            formatter={(v) => formatRp(v)}
                            contentStyle={{ background: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                        />
                        <Bar dataKey="value" fill="#fff" fillOpacity={0.9} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Kalender Penjualan ───────────────────────────────────────────────────────
function KalenderPenjualan({ kalenderData }) {
    const today = new Date();
    const [month] = useState(today.getMonth());
    const [year] = useState(today.getFullYear());

    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const daysName = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];

    const dataMap = useMemo(() => {
        const map = {};
        kalenderData.forEach(d => { map[d.day] = d.total; });
        return map;
    }, [kalenderData]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const getColor = (value) => {
        if (!value) return "bg-white/5 text-white/30";
        if (value < 3) return "bg-orange-200 text-black";
        if (value < 6) return "bg-orange-400 text-white";
        if (value < 10) return "bg-orange-500 text-white";
        return "bg-orange-600 text-white";
    };

    return (
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs text-white/60">Transaksi harian</p>
                    <h3 className="font-semibold">Kalender Penjualan</h3>
                    <p className="text-white/60 text-sm mt-0.5">{months[month]} {year}</p>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2 text-xs text-white/50">
                {daysName.map(d => <div key={d} className="text-center">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: totalCells }).map((_, i) => {
                    const day = i - firstDay + 1;
                    if (i < firstDay || day > daysInMonth) return <div key={i} />;
                    const value = dataMap[day] || 0;
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    return (
                        <div key={i}
                            className={`h-9 text-xs flex flex-col items-center justify-center rounded transition hover:scale-105
                                ${getColor(value)} ${isToday ? "ring-2 ring-white" : ""}`}>
                            <span>{day}</span>
                            {value > 0 && <span className="text-[9px] opacity-70">{value}</span>}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-3 text-[10px] text-white/40">
                <span>Sedikit</span>
                <div className="flex gap-1">
                    {["bg-white/10","bg-orange-200","bg-orange-400","bg-orange-500","bg-orange-600"].map((c,i) => (
                        <div key={i} className={`w-3 h-3 ${c} rounded`} />
                    ))}
                </div>
                <span>Banyak</span>
            </div>
        </div>
    );
}

// ─── Most Order ───────────────────────────────────────────────────────────────
function MostOrder({ orders }) {
    return (
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-[1px] rounded-2xl">
            <div className="bg-[#1e1e1e]/80 rounded-2xl p-5 h-full">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-lg">Most Order</h3>
                    <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/60">Bulan ini</span>
                </div>

                <div className="space-y-3">
                    {orders.length > 0 ? orders.map((item, i) => (
                        <div key={i} className="flex items-stretch bg-white/5 hover:bg-white/10 transition rounded-xl overflow-hidden group">
                            <div className="w-14 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-lg rounded-l-xl">
                                {item.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 px-4 py-3">
                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase">Nama</p>
                                        <p className="font-medium truncate">{item.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase">Harga</p>
                                        <p>{formatRpShort(item.price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase">Terjual</p>
                                        <p>{item.total}x</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase">Revenue</p>
                                        <p className="text-orange-400 font-medium">{formatRpShort(item.revenue)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 flex items-center justify-center bg-orange-500/50 group-hover:bg-orange-500 transition text-white rounded-r-xl text-xs font-bold">
                                #{i + 1}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-white/40 py-10 text-sm">Belum ada data</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Riwayat Pesanan ──────────────────────────────────────────────────────────
function RiwayatPesanan({ riwayat, onPrint }) {
    const scrollRef = useRef();
    const [search, setSearch] = useState("");
    const [filterPayment, setFilterPayment] = useState("Semua");

    const payments = ["Semua", "Cash", "QRIS", "Debit"];

    const filtered = useMemo(() => {
        return riwayat.filter(r => {
            const matchSearch = r.invoice_no.toLowerCase().includes(search.toLowerCase());
            const matchPayment = filterPayment === "Semua" || r.payment_method === filterPayment;
            return matchSearch && matchPayment;
        });
    }, [riwayat, search, filterPayment]);

    const getPaymentColor = (m) => {
        if (m === "Cash") return "bg-orange-500/20 text-orange-300";
        if (m === "QRIS") return "bg-green-500/20 text-green-300";
        return "bg-blue-500/20 text-blue-300";
    };

    return (
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 border border-white/20 rounded-2xl p-5 flex flex-col text-white" style={{ height: 420 }}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Riwayat Pesanan</h3>
                <div className="flex gap-1">
                    {payments.map(p => (
                        <button key={p} onClick={() => setFilterPayment(p)}
                            className={`text-xs px-2 py-1 rounded-full transition border border-white/20
                                ${filterPayment === p ? "bg-white text-orange-600 font-semibold" : "bg-white/10 hover:bg-white/20"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari invoice..."
                className="w-full mb-3 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs focus:outline-none" />

            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {filtered.length > 0 ? filtered.map((order) => (
                    <div key={order.id}
                        className="flex items-center bg-white/5 hover:bg-white/10 transition rounded-xl overflow-hidden group cursor-pointer"
                        onClick={() => onPrint(order)}>
                        <div className="flex flex-1 items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold">
                                    {order.invoice_no.slice(-3)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{order.invoice_no}</p>
                                    <p className="text-xs text-white/50">{order.sale_date} • {order.items_count} item</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-1 rounded-full ${getPaymentColor(order.payment_method)}`}>
                                    {order.payment_method}
                                </span>
                                <span className="text-sm font-bold text-orange-300">{formatRpShort(order.grand_total)}</span>
                                <PrinterIcon className="w-4 h-4 text-white/30 group-hover:text-white transition" />
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-white/40 text-sm py-10">Tidak ada pesanan</div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LaporanAdmin({ summary = {}, chartData = [], kalenderData = [], mostOrder = [], riwayat = [], bulan = "" }) {
    const [selectedSale, setSelectedSale] = useState(null);

    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Laporan" />

            {selectedSale && (
                <NotaModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
            )}

            <div className="p-4 text-white space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-4xl font-bold leading-tight">Point Of Sales</h1>
                    <h1 className="text-4xl font-bold leading-tight">Overview</h1>
                    <p className="text-white/50 text-sm mt-1">{bulan}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* LEFT */}
                    <div className="flex-1 space-y-6">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SummaryCard
                                title="Total Pendapatan"
                                value={formatRp(summary.pendapatan)}
                                growth={summary.growthPendapatan ?? 0}
                                icon={BanknotesIcon}
                                color="bg-orange-500"
                            />
                            <SummaryCard
                                title="Total Pesanan"
                                value={summary.pesanan ?? 0}
                                growth={summary.growthPesanan ?? 0}
                                icon={ShoppingCartIcon}
                                color="bg-orange-600"
                            />
                            <SummaryCard
                                title="Item Terjual"
                                value={summary.itemTerjual ?? 0}
                                growth={summary.growthItem ?? 0}
                                icon={CubeIcon}
                                color="bg-orange-700"
                            />
                        </div>

                        {/* Chart + Most Order */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MostOrder orders={mostOrder} />
                            <ChartPenjualan chartData={chartData} />
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="w-full lg:w-[380px] space-y-6">
                        <KalenderPenjualan kalenderData={kalenderData} />
                        <RiwayatPesanan riwayat={riwayat} onPrint={setSelectedSale} />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}