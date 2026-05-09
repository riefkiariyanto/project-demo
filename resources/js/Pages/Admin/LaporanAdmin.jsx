import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    PrinterIcon, XMarkIcon, BanknotesIcon, ShoppingCartIcon,
    CubeIcon, CalendarDaysIcon, ArrowPathIcon, ArrowTrendingUpIcon,
    ArrowTrendingDownIcon, ChartBarIcon, ReceiptPercentIcon,
    ClockIcon, FireIcon, SignalIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { useDarkMode } from "@/hooks/useDarkMode";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);

const fmtShort = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return `${v}`;
};

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const ORANGE = ["#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"];
const PIE_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"];

// ─── Bluetooth Printer ────────────────────────────────────────────────────────
class BluetoothPrinter {
    constructor() {
        this.device = null;
        this.characteristic = null;
        // ESC/POS service & characteristic UUIDs (common thermal printers)
        this.SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
        this.CHAR_UUID = "00002af1-0000-1000-8000-00805f9b34fb";
    }

    async connect() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [this.SERVICE_UUID] }],
                optionalServices: [this.SERVICE_UUID],
            });
            const server = await this.device.gatt.connect();
            const service = await server.getPrimaryService(this.SERVICE_UUID);
            this.characteristic = await service.getCharacteristic(this.CHAR_UUID);
            return { ok: true, name: this.device.name };
        } catch (e) {
            // Fallback: try generic printer service
            try {
                this.device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
                });
                const server = await this.device.gatt.connect();
                // Try alternate UUID used by many ESC/POS printers
                try {
                    const svc = await server.getPrimaryService("e7810a71-73ae-499d-8c15-faa9aef0c3f2");
                    this.characteristic = await svc.getCharacteristic("bef8d6c9-9c21-4c9e-b632-bd58c1009f9f");
                } catch {
                    const svc = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
                    this.characteristic = await svc.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");
                }
                return { ok: true, name: this.device.name };
            } catch (e2) {
                return { ok: false, error: e2.message };
            }
        }
    }

    async print(data) {
        if (!this.characteristic) return { ok: false, error: "Printer tidak terhubung" };
        try {
            const chunks = [];
            for (let i = 0; i < data.length; i += 512) {
                chunks.push(data.slice(i, i + 512));
            }
            for (const chunk of chunks) {
                await this.characteristic.writeValue(chunk);
                await new Promise(r => setTimeout(r, 50));
            }
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    disconnect() {
        if (this.device?.gatt?.connected) this.device.gatt.disconnect();
        this.device = null;
        this.characteristic = null;
    }

    isConnected() {
        return !!this.device?.gatt?.connected;
    }
}

const btPrinter = new BluetoothPrinter();

// ESC/POS encoder
function encodeEscPos(sale) {
    const ESC = 0x1b, GS = 0x1d, LF = 0x0a;
    const enc = new TextEncoder();
    const bytes = [];

    const push = (...args) => args.forEach(b => bytes.push(b));
    const text = (s) => enc.encode(s).forEach(b => bytes.push(b));
    const line = (s = "") => { text(s); push(LF); };
    const divider = () => line("--------------------------------");
    const centerText = (s) => {
        const pad = Math.max(0, Math.floor((32 - s.length) / 2));
        return " ".repeat(pad) + s;
    };
    const rjust = (left, right, width = 32) => {
        const space = width - left.length - right.length;
        return left + " ".repeat(Math.max(1, space)) + right;
    };

    // Init
    push(ESC, 0x40); // Initialize
    // Center align
    push(ESC, 0x61, 0x01);
    push(ESC, 0x21, 0x10); // Double height
    line("WARKOP POS");
    push(ESC, 0x21, 0x00); // Normal
    line("Nota Pembelian");
    push(ESC, 0x61, 0x00); // Left
    divider();
    line(rjust("No. Invoice:", sale.invoice_no));
    line(rjust("Tanggal:", sale.sale_date));
    line(rjust("Pembayaran:", sale.payment_method));
    divider();

    sale.items?.forEach(item => {
        line(item.name);
        const left = `  ${item.qty}x ${fmtShort(item.price)}`;
        const right = fmtShort(item.subtotal);
        line(rjust(left, right));
    });

    divider();
    push(ESC, 0x21, 0x08); // Bold
    line(rjust("TOTAL:", fmt(sale.grand_total)));
    push(ESC, 0x21, 0x00);

    if (sale.paid_amount) {
        line(rjust("Bayar:", fmt(sale.paid_amount)));
        line(rjust("Kembali:", fmt(sale.change_amount)));
    }

    divider();
    push(ESC, 0x61, 0x01);
    line("Terima kasih!");
    line("Sampai jumpa lagi :)");
    push(LF, LF, LF);
    // Cut paper
    push(GS, 0x56, 0x41, 0x03);

    return new Uint8Array(bytes);
}

// ─── Bluetooth Status Bar ─────────────────────────────────────────────────────
function BluetoothBar({ btState, onConnect, onDisconnect }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
            btState.connected
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40"
        }`}>
            <SignalIcon className={`w-3.5 h-3.5 ${btState.connected ? "text-green-400" : "text-gray-400 dark:text-white/30"}`} />
            {btState.connected ? (
                <>
                    <span>Printer: <strong className="text-green-300">{btState.name}</strong></span>
                    <button onClick={onDisconnect}
                        className="ml-auto text-red-400 hover:text-red-300 transition">
                        Putuskan
                    </button>
                </>
            ) : (
                <>
                    <span>Printer Bluetooth tidak terhubung</span>
                    <button onClick={onConnect}
                        disabled={btState.loading}
                        className="ml-auto flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition disabled:opacity-50">
                        {btState.loading
                            ? <ArrowPathIcon className="w-3 h-3 animate-spin" />
                            : <PrinterIcon className="w-3 h-3" />}
                        {btState.loading ? "Mencari..." : "Hubungkan"}
                    </button>
                </>
            )}
        </div>
    );
}

// ─── Nota Modal ───────────────────────────────────────────────────────────────
function NotaModal({ sale, onClose, btState, onConnect }) {
    const printRef = useRef();
    const [btMsg, setBtMsg] = useState(null);
    const [printing, setPrinting] = useState(false);

    const handleBrowserPrint = () => {
        const fmtCur = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);
        const itemsHtml = (sale.items ?? []).map(item => `
            <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-detail"><span>${item.qty}x ${fmtCur(item.price)}</span><span>${fmtCur(item.subtotal)}</span></div>
            </div>`).join("");
        const cashRows = sale.payment_method !== "QRIS" && sale.paid_amount > 0 ? `
            <div class="row"><span>Tunai</span><span>${fmtCur(sale.paid_amount)}</span></div>
            <div class="row"><span>Kembali</span><span>${fmtCur(sale.change_amount)}</span></div>` : "";
        const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
        <title>Nota ${sale.invoice_no}</title>
        <style>
          body{font-family:monospace;width:300px;margin:0 auto;padding:10px;color:#000}
          .center{text-align:center}.store-name{font-size:18px;font-weight:bold;margin-bottom:4px}
          .store-sub{font-size:11px;margin-bottom:8px;line-height:1.5}
          .divider{border-top:1px dashed #000;margin:8px 0}
          .item{margin-bottom:8px}.item-name{font-weight:bold;font-size:13px}
          .item-detail{display:flex;justify-content:space-between;font-size:12px}
          .total-section{font-size:13px}.row{display:flex;justify-content:space-between;margin-bottom:4px}
          .grand-total{font-size:15px;font-weight:bold}
          .info{font-size:11px;line-height:1.7}
          .footer{text-align:center;margin-top:14px;font-size:11px}
          @media print{body{width:100%}}
        </style></head><body>
        <div class="center">
          <div class="store-name">${sale.store_name ?? "Toko"}</div>
          ${sale.store_address ? `<div class="store-sub">${sale.store_address}${sale.store_phone ? '<br>' + sale.store_phone : ''}</div>` : ""}
        </div>
        <div class="divider"></div>
        <div class="info">
          <div>No. Transaksi : ${sale.invoice_no}</div>
          <div>Tanggal       : ${sale.sale_date}</div>
          <div>Kasir         : ${sale.kasir_name ?? "-"}</div>
          <div>Pembayaran    : ${sale.payment_method}</div>
        </div>
        <div class="divider"></div>
        ${itemsHtml}
        <div class="divider"></div>
        <div class="total-section">
          <div class="row grand-total"><span>TOTAL</span><span>${fmtCur(sale.grand_total)}</span></div>
          ${cashRows}
        </div>
        <div class="divider"></div>
        <div class="footer">
          <div>Terima kasih telah berkunjung!</div>
          <div style="margin-top:8px;font-size:13px;font-weight:bold;letter-spacing:2px;">WERP</div>
        </div>
        <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
        </body></html>`;
        const w = window.open("", "_blank", "width=400,height=600");
        w.document.write(html);
        w.document.close();
    };

    const handleBTPrint = async () => {
        if (!btState.connected) {
            setBtMsg({ type: "error", text: "Printer belum terhubung. Hubungkan dulu." });
            return;
        }
        setPrinting(true);
        setBtMsg(null);
        const data = encodeEscPos(sale);
        const res = await btPrinter.print(data);
        setPrinting(false);
        setBtMsg(res.ok
            ? { type: "ok", text: "Berhasil dicetak!" }
            : { type: "error", text: res.error });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                    <h3 className="font-bold tracking-wide">Nota Transaksi</h3>
                    <div className="flex gap-2">
                        <button onClick={handleBTPrint} disabled={printing}
                            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                            {printing
                                ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                : <SignalIcon className="w-4 h-4" />}
                            BT Print
                        </button>
                        <button onClick={handleBrowserPrint}
                            className="flex items-center gap-1.5 bg-white text-orange-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-50 transition">
                            <PrinterIcon className="w-4 h-4" /> Print
                        </button>
                        <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* BT status */}
                {!btState.connected && (
                    <div className="px-5 pt-3">
                        <button onClick={onConnect}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-xl text-xs hover:bg-orange-500/30 transition">
                            <SignalIcon className="w-3.5 h-3.5" />
                            Hubungkan printer Bluetooth untuk cetak langsung
                        </button>
                    </div>
                )}

                {btMsg && (
                    <div className={`mx-5 mt-3 px-3 py-2 rounded-xl text-xs ${
                        btMsg.type === "ok"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}>{btMsg.text}</div>
                )}

                {/* Nota */}
                <div ref={printRef} className="p-5 font-mono text-sm text-white bg-[#1a1a1a]">
                    <div className="text-center font-bold text-lg mb-0.5">{sale.store_name ?? "Toko"}</div>
                    {sale.store_address && <div className="text-center text-xs text-white/40">{sale.store_address}</div>}
                    {sale.store_phone && <div className="text-center text-xs text-white/40 mb-3">{sale.store_phone}</div>}
                    <div className="border-t border-dashed border-white/20 my-2" />
                    {[["No. Transaksi", sale.invoice_no], ["Tanggal", sale.sale_date], ["Kasir", sale.kasir_name], ["Pembayaran", sale.payment_method]].map(([k, v]) => v ? (
                        <div key={k} className="flex justify-between text-xs py-0.5">
                            <span className="text-white/50">{k}</span>
                            <span className="font-semibold">{v}</span>
                        </div>
                    ) : null)}
                    <div className="border-t border-dashed border-white/20 my-2" />
                    {sale.items?.map((item, i) => (
                        <div key={i} className="mb-1.5">
                            <div className="font-semibold text-xs">{item.name}</div>
                            <div className="flex justify-between text-xs text-white/50">
                                <span>{item.qty}x {fmt(item.price)}</span>
                                <span className="text-white">{fmt(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                    <div className="border-t border-dashed border-white/20 my-2" />
                    <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL</span><span className="text-orange-400">{fmt(sale.grand_total)}</span>
                    </div>
                    {sale.paid_amount > 0 && <>
                        <div className="flex justify-between text-xs text-white/50 mt-1">
                            <span>Bayar</span><span>{fmt(sale.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-white/50">
                            <span>Kembali</span><span>{fmt(sale.change_amount)}</span>
                        </div>
                    </>}
                    <div className="border-t border-dashed border-white/20 my-2 mt-4" />
                    <div className="text-center text-xs text-white/30">Terima kasih telah berkunjung!</div>
                    <div className="text-center text-sm font-bold tracking-widest text-white/50 mt-1">WERP</div>
                </div>
            </div>
        </div>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, growth, icon: Icon, color, sub, loading, noGrowth, hint }) {
    const pos = growth >= 0;
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${color}`}>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-white/5" />

            <div className="relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs text-white/60 font-medium uppercase tracking-wider">{title}</p>
                        {hint && <p className="text-[10px] text-white/40 mt-0.5">{hint}</p>}
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                </div>
                {loading ? (
                    <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse mb-2" />
                ) : (
                    <p className="text-xl font-bold text-white mb-1 leading-tight break-all">{value}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400 dark:text-white/40">{sub}</p>
                    {!noGrowth && (loading ? (
                        <div className="h-5 w-14 bg-white/10 rounded animate-pulse" />
                    ) : (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${pos ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {pos ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                            {pos ? "+" : ""}{growth}%
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Summary Section ──────────────────────────────────────────────────────────
function SummarySection({ summary, bulan }) {
    const [mode, setMode] = useState("bulan");
    const [tanggal, setTanggal] = useState(todayStr());
    const [harian, setHarian] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHarian = async (tgl) => {
        setLoading(true); setError(null);
        try {
            const res = await axios.get("/laporan/harian", { params: { tanggal: tgl } });
            setHarian(res.data);
        } catch {
            setError("Gagal memuat data harian.");
        } finally { setLoading(false); }
    };

    useEffect(() => { if (mode === "hari") fetchHarian(tanggal); }, [mode]);

    const data = mode === "bulan" ? summary : harian;
    const sub = mode === "bulan" ? "vs bulan lalu" : (harian?.labelBanding ?? "vs kemarin");
    const label = mode === "bulan" ? bulan : (harian?.label ?? tanggal);

    const cards = [
        { title: "Pendapatan Kotor", value: data ? fmt(data.pendapatan) : "-", growth: data?.growthPendapatan ?? 0, icon: BanknotesIcon, color: "from-orange-600 to-orange-700" },
        { title: "HPP", value: data ? fmt(data.hpp ?? 0) : "-", growth: 0, icon: CubeIcon, color: "from-slate-600 to-slate-700", noGrowth: true, hint: "Harga Pokok Penjualan" },
        { title: "Pendapatan Bersih", value: data ? fmt(data.bersih ?? 0) : "-", growth: data?.growthBersih ?? 0, icon: ReceiptPercentIcon, color: "from-green-600 to-green-700" },
        { title: "Total Pesanan", value: data ? (data.pesanan ?? 0) : "-", growth: data?.growthPesanan ?? 0, icon: ShoppingCartIcon, color: "from-rose-600 to-rose-700" },
    ];

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 gap-1">
                    {[["bulan", "Per Bulan"], ["hari", "Per Hari"]].map(([v, l]) => (
                        <button key={v} onClick={() => setMode(v)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${mode === v ? "bg-orange-500 text-white shadow-lg" : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"}`}>
                            {v === "hari" && <CalendarDaysIcon className="w-3.5 h-3.5" />}
                            {l}
                        </button>
                    ))}
                </div>
                {mode === "hari" && (
                    <div className="flex items-center gap-2">
                        <input type="date" value={tanggal} max={todayStr()}
                            onChange={e => { setTanggal(e.target.value); fetchHarian(e.target.value); }}
                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 [color-scheme:dark]" />
                        {loading && <ArrowPathIcon className="w-4 h-4 text-orange-400 animate-spin" />}
                    </div>
                )}
                <span className="ml-auto text-sm text-gray-400 dark:text-white/30 font-medium">{label}</span>
            </div>

            {error && <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(c => <KpiCard key={c.title} {...c} sub={sub} loading={mode === "hari" && loading} />)}
            </div>
        </div>
    );
}

// ─── Revenue Trend Chart ──────────────────────────────────────────────────────
function RevenueTrend({ chartData }) {
    const [view, setView] = useState("area");
    const formatted = useMemo(() =>
        chartData.map(d => ({
            ...d,
            label: new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        })), [chartData]);

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h3 className="font-semibold text-base">Tren Pendapatan</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Harian bulan ini</p>
                </div>
                <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                    {[["area", "Area"], ["bar", "Bar"]].map(([v, l]) => (
                        <button key={v} onClick={() => setView(v)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition ${view === v ? "bg-orange-500 text-white" : "text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    {view === "area" ? (
                        <AreaChart data={formatted}>
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" stroke="#ffffff40" fontSize={10} interval="preserveStartEnd" />
                            <YAxis stroke="#ffffff40" fontSize={10} tickFormatter={fmtShort} width={45} />
                            <Tooltip formatter={v => [fmt(v), "Pendapatan"]}
                                contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12 }} />
                            <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: "#f97316" }} />
                        </AreaChart>
                    ) : (
                        <BarChart data={formatted}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" stroke="#ffffff40" fontSize={10} interval="preserveStartEnd" />
                            <YAxis stroke="#ffffff40" fontSize={10} tickFormatter={fmtShort} width={45} />
                            <Tooltip formatter={v => [fmt(v), "Pendapatan"]}
                                contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12 }} />
                            <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Payment Mix Pie ──────────────────────────────────────────────────────────
function PaymentMix({ riwayat }) {
    const data = useMemo(() => {
        const map = {};
        riwayat.forEach(r => { map[r.payment_method] = (map[r.payment_method] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [riwayat]);

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-gray-900 dark:text-white">
            <div className="mb-4">
                <h3 className="font-semibold text-base">Metode Pembayaran</h3>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Distribusi transaksi</p>
            </div>
            <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                            paddingAngle={3} dataKey="value">
                            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                        <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-gray-500 dark:text-white/50" style={{ fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Kalender Penjualan ───────────────────────────────────────────────────────
function KalenderPenjualan({ kalenderData }) {
    const today = new Date();
    const month = today.getMonth(), year = today.getFullYear();
    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const daysName = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];

    const dataMap = useMemo(() => {
        const m = {}; kalenderData.forEach(d => { m[d.day] = d.total; }); return m;
    }, [kalenderData]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const getColor = (v) => {
        if (!v) return "bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/20";
        if (v < 3) return "bg-orange-900/60 text-orange-200";
        if (v < 6) return "bg-orange-700/70 text-white";
        if (v < 10) return "bg-orange-500 text-white";
        return "bg-orange-400 text-white font-bold";
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold">Kalender Penjualan</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{months[month]} {year}</p>
                </div>
                <FireIcon className="w-5 h-5 text-orange-400" />
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysName.map(d => <div key={d} className="text-center text-[10px] text-gray-400 dark:text-white/30">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: totalCells }).map((_, i) => {
                    const day = i - firstDay + 1;
                    if (i < firstDay || day > daysInMonth) return <div key={i} />;
                    const v = dataMap[day] || 0;
                    const isToday = day === today.getDate() && month === today.getMonth();
                    return (
                        <div key={i} title={v ? `${v} transaksi` : ""}
                            className={`h-8 text-[10px] flex flex-col items-center justify-center rounded-lg transition hover:scale-110 cursor-default
                                ${getColor(v)} ${isToday ? "ring-2 ring-orange-400 ring-offset-1 ring-offset-transparent" : ""}`}>
                            <span>{day}</span>
                            {v > 0 && <span className="text-[8px] opacity-70">{v}</span>}
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between items-center mt-3 text-[10px] text-gray-400 dark:text-white/30">
                <span>Sedikit</span>
                <div className="flex gap-1">
                    {["bg-gray-200 dark:bg-white/10","bg-orange-900/60","bg-orange-700/70","bg-orange-500","bg-orange-400"].map((c,i) => (
                        <div key={i} className={`w-3 h-3 rounded ${c}`} />
                    ))}
                </div>
                <span>Banyak</span>
            </div>
        </div>
    );
}

// ─── Most Order ───────────────────────────────────────────────────────────────
function MostOrder({ orders }) {
    const maxQty = orders[0]?.total || 1;
    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h3 className="font-semibold">Produk Terlaris</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Bulan ini</p>
                </div>
                <ChartBarIcon className="w-5 h-5 text-orange-400" />
            </div>
            <div className="space-y-3">
                {orders.length > 0 ? orders.map((item, i) => (
                    <div key={i} className="group">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                                    ${i === 0 ? "bg-amber-500 text-black" : i === 1 ? "bg-slate-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/50"}`}>
                                    {i + 1}
                                </span>
                                <span className="text-sm font-medium truncate max-w-[140px]">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-orange-400">{item.total}x</p>
                                <p className="text-[10px] text-gray-400 dark:text-white/40">{fmtShort(item.revenue)}</p>
                            </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-700"
                                style={{ width: `${(item.total / maxQty) * 100}%` }} />
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-400 dark:text-white/30 text-sm py-8">Belum ada data</div>
                )}
            </div>
        </div>
    );
}

// ─── Jam Sibuk ────────────────────────────────────────────────────────────────
function JamSibuk({ riwayat }) {
    const data = useMemo(() => {
        const hours = Array.from({ length: 24 }, (_, i) => ({ jam: `${i}`, count: 0 }));
        riwayat.forEach(r => {
            const match = r.sale_date?.match(/(\d{2})\/(\d{2})\/\d{4} (\d{2}):/);
            if (match) { const h = parseInt(match[3]); if (hours[h]) hours[h].count++; }
        });
        return hours.filter(h => h.count > 0);
    }, [riwayat]);

    const peak = data.reduce((a, b) => a.count > b.count ? a : b, { jam: "-", count: 0 });

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold">Jam Tersibuk</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Distribusi per jam</p>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1 rounded-full">
                    <ClockIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs text-orange-400 font-medium">{peak.jam}:00</span>
                </div>
            </div>
            <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                        <XAxis dataKey="jam" stroke="#ffffff20" fontSize={9} />
                        <YAxis stroke="#ffffff20" fontSize={9} />
                        <Tooltip formatter={v => [v, "Transaksi"]}
                            contentStyle={{ background: "#1f2937", border: "none", borderRadius: 8, color: "#fff", fontSize: 11 }} />
                        <Bar dataKey="count" fill="#f97316" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Riwayat Pesanan ──────────────────────────────────────────────────────────
function RiwayatPesanan({ riwayat, onPrint }) {
    const [search, setSearch] = useState("");
    const [filterPayment, setFilterPayment] = useState("Semua");
    const payments = ["Semua", "Cash", "QRIS", "Debit"];

    const filtered = useMemo(() => riwayat.filter(r => {
        const matchSearch = r.invoice_no.toLowerCase().includes(search.toLowerCase());
        const matchPay = filterPayment === "Semua" || r.payment_method === filterPayment;
        return matchSearch && matchPay;
    }), [riwayat, search, filterPayment]);

    const payColor = (m) => ({
        Cash: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-500/20",
        QRIS: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/20",
        Debit: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
    }[m] || "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 border-gray-200 dark:border-white/10");

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-gray-900 dark:text-white flex flex-col" style={{ height: 480 }}>
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="font-semibold">Riwayat Transaksi</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{filtered.length} transaksi</p>
                </div>
                <div className="flex gap-1">
                    {payments.map(p => (
                        <button key={p} onClick={() => setFilterPayment(p)}
                            className={`text-xs px-2 py-1 rounded-lg transition border ${filterPayment === p ? "bg-orange-500 border-orange-500 text-white font-semibold" : "border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari no. invoice..."
                className="w-full mb-3 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-xs focus:outline-none focus:border-orange-500 transition" />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "none" }}>
                {filtered.length > 0 ? filtered.map(order => (
                    <div key={order.id} onClick={() => onPrint(order)}
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500/50 transition rounded-xl cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {order.invoice_no.slice(-3)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{order.invoice_no}</p>
                            <p className="text-xs text-gray-400 dark:text-white/40">{order.sale_date} · {order.items_count} item</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${payColor(order.payment_method)}`}>
                                {order.payment_method}
                            </span>
                            <span className="text-sm font-bold text-orange-500">{fmtShort(order.grand_total)}</span>
                            <PrinterIcon className="w-3.5 h-3.5 text-gray-300 dark:text-white/20 group-hover:text-orange-400 transition" />
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-400 dark:text-white/30 text-sm py-12">Tidak ada transaksi</div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LaporanAdmin({
    summary = {}, chartData = [], kalenderData = [],
    mostOrder = [], riwayat = [], bulan = ""
}) {
    const { isDark } = useDarkMode();
    const [selectedSale, setSelectedSale] = useState(null);
    const [btState, setBtState] = useState({ connected: false, loading: false, name: null });

    const connectBT = useCallback(async () => {
        if (!navigator.bluetooth) {
            alert("Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome/Edge terbaru.");
            return;
        }
        setBtState(s => ({ ...s, loading: true }));
        const res = await btPrinter.connect();
        setBtState({ connected: res.ok, loading: false, name: res.ok ? res.name : null });
        if (!res.ok) alert(`Gagal terhubung: ${res.error}`);
    }, []);

    const disconnectBT = useCallback(() => {
        btPrinter.disconnect();
        setBtState({ connected: false, loading: false, name: null });
    }, []);

    // Hitung statistik tambahan
    const stats = useMemo(() => {
        const totalPendapatan = summary.pendapatan || 0;
        const totalPesanan = summary.pesanan || 0;
        const avgPerOrder = totalPesanan > 0 ? totalPendapatan / totalPesanan : 0;
        const topDay = chartData.reduce((a, b) => (a.total || 0) > (b.total || 0) ? a : b, {});
        return { avgPerOrder, topDay };
    }, [summary, chartData]);

    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Laporan" />

            {selectedSale && (
                <NotaModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                    btState={btState}
                    onConnect={connectBT}
                />
            )}

            <div className="p-4 space-y-6 text-gray-900 dark:text-white">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-xs text-orange-400 font-semibold uppercase tracking-widest mb-1">Point of Sales</p>
                        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">Laporan Penjualan</h1>
                        <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{bulan}</p>
                    </div>
                    <BluetoothBar btState={btState} onConnect={connectBT} onDisconnect={disconnectBT} />
                </div>

                {/* ── KPI Cards + Toggle ── */}
                <SummarySection summary={summary} bulan={bulan} />

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left col (2/3) */}
                    <div className="xl:col-span-2 space-y-6">
                        <RevenueTrend chartData={chartData} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MostOrder orders={mostOrder} />
                            <div className="space-y-6">
                                <PaymentMix riwayat={riwayat} />
                                <JamSibuk riwayat={riwayat} />
                            </div>
                        </div>
                    </div>

                    {/* Right col (1/3) */}
                    <div className="space-y-6">
                        <KalenderPenjualan kalenderData={kalenderData} />
                        <RiwayatPesanan riwayat={riwayat} onPrint={setSelectedSale} />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}