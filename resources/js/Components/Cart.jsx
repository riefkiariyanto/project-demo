import { buildEscPos, buildReceiptHTML, buildLogoBytes } from '@/helpers/escpos';
import { useRef, useState, useEffect } from "react";
<<<<<<< HEAD
<<<<<<< HEAD
import {
    X,
    Minus,
    Plus,
    Trash2,
    Banknote,
    Smartphone,
    CreditCard,
    UtensilsCrossed,
    ShoppingBag,
    ShoppingCart,
    ChevronRight,
} from "lucide-react";
=======
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/solid";
import BluetoothPrinterModal from "@/Components/BluetoothPrinterModal";
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab

const isNative = () => typeof window !== "undefined" && window.Capacitor?.isNative;

function PrintModal({ data, onPrint, onClose, formatCurrency }) {
    const [showBT, setShowBT] = useState(false);

    const [autoPrinting, setAutoPrinting] = useState(false);

    const autoPrint = async () => {
        const saved = (() => {
            try { return JSON.parse(localStorage.getItem('werp_bt_printer')); } catch { return null; }
        })();

        if (!saved?.address) {
            setShowBT(true);
            return;
        }

        setAutoPrinting(true);
        const bt = window.bluetoothSerial;

        const logoBitmap = data.store?.logo
            ? await buildLogoBytes('/storage/' + data.store.logo).catch(() => [])
            : [];

        bt.connect(
            saved.address,
            () => {
                const bytes = buildEscPos({ ...data, logoBitmap });
                bt.write(
                    bytes,
                    () => { setAutoPrinting(false); onClose(); },
                    () => { setAutoPrinting(false); setShowBT(true); }
                );
            },
            () => { setAutoPrinting(false); setShowBT(true); }
        );
    };

    if (!data) return null;
    return (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4 pb-20 sm:pb-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="bg-green-500 px-6 py-5 text-white text-center">
                    <div className="text-4xl mb-2">✓</div>
                    <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
                    <p className="text-sm opacity-90 mt-1">{data.invoiceNo}</p>
                </div>

                {/* Summary */}
                <div className="px-6 py-4 space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Total</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(data.total)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Metode</span>
                        <span className="font-semibold">{data.payment}</span>
                    </div>
                    {data.payment !== "QRIS" && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">Tunai</span>
                                <span>{formatCurrency(data.paid)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-slate-400">Kembalian</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(data.change)}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Item</span>
                        <span>{data.items.reduce((s, i) => s + i.qty, 0)} item</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm">
                        Lewati
                    </button>
                    {isNative() ? (
                        <button onClick={autoPrint} disabled={autoPrinting}
                            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                            {autoPrinting ? '⏳ Menghubungkan...' : '🖨️ Cetak Nota'}
                        </button>
                    ) : (
                        <button onClick={() => { onPrint(); onClose(); }}
                            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition text-sm flex items-center justify-center gap-2">
                            🖨️ Cetak Nota
                        </button>
                    )}
                </div>
            </div>
            {showBT && (
                <BluetoothPrinterModal
                    receiptData={data}
                    onClose={() => { setShowBT(false); onClose(); }}
                    formatCurrency={formatCurrency}
                />
            )}
        </div>
    );
}


export default function Cart({ cart, open, setOpen, setCart, qrisImage = null, isMobile = false, store = null, kasirName = "" }) {
    const scrollRef = useRef();

    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

<<<<<<< HEAD
<<<<<<< HEAD
    const [payment, setPayment] = useState("Cash");
    const [orderType, setOrderType] = useState("Dine In");
    const [orderId, setOrderId] = useState("");

=======
    // 🔥 PAYMENT
=======
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
    const [payment, setPayment] = useState("Cash");
    const [paidAmount, setPaidAmount] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [orderId, setOrderId] = useState("");
    const [notification, setNotification] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [lastSaleData, setLastSaleData] = useState(null);

<<<<<<< HEAD
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    // =========================
    // GENERATE ORDER ID
    // =========================
    const generateOrderId = () => {
        const date = new Date();
<<<<<<< HEAD
=======

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        const yy = String(date.getFullYear()).slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        const key = `order-counter-${yy}${mm}${dd}`;
        let counter = parseInt(localStorage.getItem(key) || "0");
<<<<<<< HEAD
        counter += 1;
        localStorage.setItem(key, counter);

        return `#ORD-${yy}${mm}${dd}-${String(counter).padStart(3, "0")}`;
    };

=======

        counter += 1;
        localStorage.setItem(key, counter);

        const number = String(counter).padStart(3, "0");

        return `#ORD-${yy}${mm}${dd}-${number}`;
    };

    // =========================
    // GENERATE SAAT BUKA CART
    // =========================
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    useEffect(() => {
        if (open && cart.length > 0 && !orderId) {
            setOrderId(generateOrderId());
        }
    }, [open, cart]);

    // =========================
<<<<<<< HEAD
=======
    // AUTO CLOSE NOTIFICATION
    // =========================
=======
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

<<<<<<< HEAD
    // =========================
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    // DRAG SCROLL
    // =========================
    const handleMouseDown = (e) => {
        const el = scrollRef.current;
        if (!el) return;
<<<<<<< HEAD
=======

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
    // drag-scroll (desktop)
    const handleMouseDown = (e) => {
        const el = scrollRef.current;
        if (!el) return;
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
        setIsDown(true);
        setStartY(e.pageY);
        setScrollTop(el.scrollTop);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
<<<<<<< HEAD
<<<<<<< HEAD
        const el = scrollRef.current;
        if (!el) return;
=======

        const el = scrollRef.current;
        if (!el) return;

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
        const el = scrollRef.current;
        if (!el) return;
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
        e.preventDefault();
        el.scrollTop = scrollTop - (e.pageY - startY) * 0.8;
    };

    const stopDrag = () => setIsDown(false);

    useEffect(() => {
        const up = () => setIsDown(false);
        window.addEventListener("mouseup", up);
        return () => window.removeEventListener("mouseup", up);
    }, []);

    // desktop swipe-to-close
    const touchStartX = useRef(0);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsDragging(true);
    };
    const handleTouchMove = (e) => {
        if (!isDragging) return;
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
        const diff = e.touches[0].clientX - touchStartX.current;
        if (diff > 0) setDragX(diff);
    };
    const handleTouchEnd = () => {
        setIsDragging(false);
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
        if (dragX > 120) setOpen(false);
        setDragX(0);
    };

    // auto-close when cart empty
    useEffect(() => {
        if (cart.length === 0) setOpen(false);
    }, [cart]);

<<<<<<< HEAD
    // =========================
<<<<<<< HEAD
    // CART ACTIONS
    // =========================
    const increaseQty = (i) =>
=======
    // ACTION
    // =========================
    const increaseQty = (i) => {
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        setCart((prev) =>
            prev.map((item, index) =>
                index === i ? { ...item, qty: item.qty + 1 } : item
            )
        );
<<<<<<< HEAD

    const decreaseQty = (i) =>
=======
    };

    const decreaseQty = (i) => {
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
    const increaseQty = (i) =>
        setCart((prev) => prev.map((item, idx) => idx === i ? { ...item, qty: item.qty + 1 } : item));

    const decreaseQty = (i) =>
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
        setCart((prev) =>
            prev.map((item, idx) => idx === i ? { ...item, qty: item.qty - 1 } : item)
                .filter((item) => item.qty > 0)
        );
<<<<<<< HEAD
<<<<<<< HEAD

    const removeItem = (i) =>
        setCart((prev) => prev.filter((_, index) => index !== i));

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
=======
    };
=======
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab

    const removeItem = (i) =>
        setCart((prev) => prev.filter((_, idx) => idx !== i));

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

<<<<<<< HEAD
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d

    // =========================
    // HANDLE PAY
    // =========================
<<<<<<< HEAD
    const handlePay = () => {
        alert(`Order ${orderId}\n${orderType} · ${payment}\nTotal: $${total.toFixed(2)}`);
        setCart([]);
        setOrderId("");
        setPayment("Cash");
        setOrderType("Dine In");
    };

    // =========================
    // ICON MAPS
    // =========================
    const paymentIcons = {
        Cash: <Banknote size={16} />,
        QRIS: <Smartphone size={16} />,
        Debit: <CreditCard size={16} />,
    };

    const orderTypeConfig = {
        "Dine In": { icon: <UtensilsCrossed size={15} />, label: "Dine In" },
        "Take Away": { icon: <ShoppingBag size={15} />, label: "Take Away" },
    };

    return (
        /* No backdrop — layar belakang tetap bisa diakses */
        <div
            className={`
                fixed top-0 right-0 h-full z-50
                transition-all duration-300 ease-in-out
                ${open ? "w-[300px] sm:w-[340px]" : "w-0"}
            `}
        >
            {open && (
                <div
                    style={{ transform: `translateX(${dragX}px)` }}
                    className="h-full w-full flex flex-col overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="h-full flex flex-col bg-white rounded-l-3xl shadow-2xl overflow-hidden border-l border-gray-100">

                        {/* ── HEADER ── */}
                        <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-5 pt-6 pb-5 overflow-hidden">
                            {/* Decorative rings */}
                            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full border-[16px] border-white/10 pointer-events-none" />
                            <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full border-[8px] border-white/10 pointer-events-none" />

                            {/* Title row */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <ShoppingCart size={18} className="text-white/80" />
                                        <h2 className="font-black text-white text-xl tracking-tight leading-none">
                                            Your Order
                                        </h2>
                                    </div>
                                    {orderId && (
                                        <p className="text-orange-100/70 text-xs mt-1 font-mono pl-[26px]">
                                            {orderId}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="bg-white/25 rounded-full px-2.5 py-1 text-white text-xs font-bold">
                                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                                    </div>

                                    <button
                                        onClick={() => setOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition"
                                    >
                                        <X size={15} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                            {/* ── ORDER TYPE TOGGLE ── */}
                            <div className="bg-white/20 rounded-2xl p-1 flex gap-1">
                                {["Dine In", "Take Away"].map((type) => {
                                    const active = orderType === type;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`
                                                flex-1 flex items-center justify-center gap-1.5
                                                py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                                                ${active
                                                    ? "bg-white text-orange-500 shadow-md"
                                                    : "text-white/90 hover:bg-white/15"
                                                }
                                            `}
                                        >
                                            <span className={active ? "text-orange-500" : "text-white"}>
                                                {orderTypeConfig[type].icon}
                                            </span>
                                            <span>{orderTypeConfig[type].label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── ITEM LIST ── */}
=======
=======
    const formatCurrency = (value) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
    const handlePay = async () => {
        const isQris = payment === "QRIS";
        const paid = isQris ? total : Number(paidAmount) || 0;

        if (!isQris && paid < total) {
            setNotification({ type: "error", title: "Pembayaran Kurang!", message: `Kurang: ${formatCurrency(total - paid)}` });
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch("/sales", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content"),
                },
                body: JSON.stringify({
                    items: cart.map((item) => ({ product_id: item.id, qty: item.qty, price: item.price })),
                    payment_method: payment,
                    paid_amount: paid,
                    subtotal: total,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const now = new Date();
                const saleDate = now.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
                    + " " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

                setLastSaleData({
                    invoiceNo: data.invoice_no ?? "",
                    saleDate,
                    items: [...cart],
                    total,
                    payment,
                    paid,
                    change: data.change ?? 0,
                });
                setShowPaymentModal(false);
                setShowPrintModal(true);
                setCart([]);
                setOrderId("");
                setPayment("Cash");
                setPaidAmount("");
                setOpen(false);
            } else {
                setNotification({ type: "error", title: "Pembayaran Gagal!", message: data.message || "Terjadi kesalahan, coba lagi" });
            }
        } catch (error) {
            setNotification({ type: "error", title: "Pembayaran Gagal!", message: error.message || "Terjadi kesalahan jaringan" });
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintNota = () => {
        if (!lastSaleData) return;
        const html = buildReceiptHTML({ store, kasirName, ...lastSaleData });
        const w = window.open("", "_blank", "width=380,height=600");
        w.document.write(html);
        w.document.close();
    };

    const closePrintModal = () => {
        setShowPrintModal(false);
        setLastSaleData(null);
    };

    // ──────────────────────────────────────────────────────────────
    // MOBILE: floating bar + full-screen modal
    // ──────────────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <>
                {/* FLOATING BAR — shown when cart has items */}
                {cart.length > 0 && (
                    <div
                        className="fixed bottom-[88px] left-4 right-4 z-40"
                        onClick={() => setOpen(true)}
                    >
                        <div className="bg-orange-500 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-transform cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <ShoppingCartIcon className="w-6 h-6" />
                                    <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {totalQty}
                                    </span>
                                </div>
                                <span className="font-semibold text-sm">{totalQty} item</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold">{formatCurrency(total)}</span>
                                <span className="bg-white text-orange-500 font-bold text-xs px-3 py-1.5 rounded-xl">
                                    Lihat Pesanan
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* FULL-SCREEN MODAL */}
                {open && (
                    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                        {/* HEADER */}
                        <div className="px-5 py-4 flex justify-between items-center border-b border-gray-200 dark:border-slate-700 shrink-0">
                            <div>
                                <h2 className="font-bold text-lg">Pesanan</h2>
                                {orderId && <p className="text-xs text-gray-400 dark:text-slate-400">{orderId}</p>}
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* ITEM LIST */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                            {cart.map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</span>
                                        <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => decreaseQty(i)} className="bg-gray-200 dark:bg-slate-600 w-8 h-8 rounded-xl font-bold text-lg text-gray-700 dark:text-white">-</button>
                                            <span className="w-6 text-center font-semibold">{item.qty}</span>
                                            <button onClick={() => increaseQty(i)} className="bg-gray-200 dark:bg-slate-600 w-8 h-8 rounded-xl font-bold text-lg text-gray-700 dark:text-white">+</button>
                                        </div>
                                        <span className="font-bold text-sm text-orange-500">{formatCurrency(item.price * item.qty)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3 shrink-0 bg-gray-50 dark:bg-slate-900/80">
                            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Metode Pembayaran</p>
                            <div className="flex gap-2">
                                {["Cash", "QRIS", "Debit"].map((method) => (
                                    <button key={method} onClick={() => setPayment(method)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${payment === method ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600"}`}>
                                        {method}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span className="text-orange-500">{formatCurrency(total)}</span>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                disabled={cart.length === 0 || processing}
                                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50 shadow-lg"
                            >
                                {processing ? "Memproses..." : "Bayar Sekarang"}
                            </button>
                        </div>
                    </div>
                )}

                {/* PAYMENT MODAL — CASH / DEBIT */}
                {showPaymentModal && payment !== "QRIS" && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 pb-20 sm:pb-4">
                        <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
                            <h3 className="text-xl font-bold">Input Pembayaran</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">Total Belanja</p>
                                <p className="text-2xl font-bold text-orange-400">{formatCurrency(total)}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Nominal Pembayaran</label>
                                <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-[#111827] border border-gray-700 text-white text-lg"
                                    placeholder="0" min="0" step="1000" autoFocus />
                            </div>
                            {paidAmount && Number(paidAmount) >= total && (
                                <div className="bg-green-900/30 border border-green-600 rounded-xl p-3">
                                    <p className="text-sm text-gray-300">Kembalian</p>
                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(Number(paidAmount) - total)}</p>
                                </div>
                            )}
                            {paidAmount && Number(paidAmount) < total && (
                                <div className="text-sm text-red-400 bg-red-900/30 border border-red-600 rounded-xl p-3">
                                    Nominal kurang {formatCurrency(total - Number(paidAmount))}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setShowPaymentModal(false)} disabled={processing}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition disabled:opacity-50">Batal</button>
                                <button onClick={handlePay} disabled={!paidAmount || Number(paidAmount) < total || processing}
                                    className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50 font-semibold">
                                    {processing ? "Memproses..." : "Bayar"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYMENT MODAL — QRIS */}
                {showPaymentModal && payment === "QRIS" && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 pb-20 sm:pb-4">
                        <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-sm text-white space-y-4 shadow-2xl">
                            <div className="text-center">
                                <h3 className="text-xl font-bold">Bayar via QRIS</h3>
                                <p className="text-sm text-gray-400 mt-1">Scan QR di bawah dengan e-wallet</p>
                            </div>
                            <div className="flex justify-center">
                                {qrisImage ? (
                                    <img src={`/storage/${qrisImage}`} alt="QRIS" className="w-56 h-56 object-contain rounded-xl border-4 border-white bg-white" />
                                ) : (
                                    <div className="w-56 h-56 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-500">
                                        <span className="text-5xl">📷</span>
                                        <p className="text-xs text-center px-4">QR belum diupload. Upload di Pengaturan → Profil Toko</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-3 text-center">
                                <p className="text-xs text-gray-400">Total yang harus dibayar</p>
                                <p className="text-2xl font-bold text-orange-400">{formatCurrency(total)}</p>
                            </div>
                            <p className="text-xs text-gray-500 text-center">Setelah customer membayar, klik konfirmasi</p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowPaymentModal(false)} disabled={processing}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition disabled:opacity-50">Batal</button>
                                <button onClick={handlePay} disabled={processing}
                                    className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 font-semibold">
                                    {processing ? "Memproses..." : "Konfirmasi Diterima"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOTIFICATION */}
                {notification && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} text-white rounded-2xl shadow-2xl p-5 w-[90%] max-w-md`}>
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">{notification.type === "success" ? "✓" : "✕"}</div>
                            <div>
                                <p className="font-bold">{notification.title}</p>
                                <p className="text-sm opacity-90">{notification.message}</p>
                                {notification.invoice && <p className="text-xs opacity-75 mt-1">Invoice: {notification.invoice}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* PRINT MODAL */}
                {showPrintModal && <PrintModal data={lastSaleData} onPrint={handlePrintNota} onClose={closePrintModal} formatCurrency={formatCurrency} />}
            </>
        );
    }

    // ──────────────────────────────────────────────────────────────
    // DESKTOP: side panel (non-fixed, fills wrapper in Kasir.jsx)
    // ──────────────────────────────────────────────────────────────
    return (
        <>
            <div className="h-full w-full flex flex-col bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-l-3xl shadow-xl border-l border-gray-200 dark:border-slate-700 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {open && (
                    <div className="h-full flex flex-col">
                        {/* HEADER */}
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg">Cart</h2>
                                {orderId && <p className="text-xs text-gray-400 dark:text-slate-400">{orderId}</p>}
                            </div>
                            <button onClick={() => setOpen(false)} className="hover:bg-gray-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg transition">✕</button>
                        </div>

                        {/* LIST */}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                        <div
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={stopDrag}
                            onMouseLeave={stopDrag}
<<<<<<< HEAD
                            className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {cart.length === 0 && (
                                <div className="flex flex-col items-center justify-center mt-12 gap-2 text-gray-300">
                                    <ShoppingCart size={36} strokeWidth={1.2} />
                                    <p className="text-sm font-medium">Belum ada pesanan</p>
                                </div>
                            )}

                            {cart.map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex flex-col gap-2.5 hover:border-orange-200 transition"
                                >
                                    {/* Name + Remove */}
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-gray-800 text-sm leading-tight flex-1">
                                            {item.name}
                                        </span>
                                        <button
                                            onClick={() => removeItem(i)}
                                            className="ml-2 text-gray-300 hover:text-red-400 transition shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Qty + Price */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => decreaseQty(i)}
                                                className="w-8 h-8 flex items-center justify-center text-orange-400 hover:bg-orange-50 transition"
                                            >
                                                <Minus size={13} strokeWidth={2.5} />
                                            </button>
                                            <span className="w-7 text-center text-sm font-bold text-gray-700">
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() => increaseQty(i)}
                                                className="w-8 h-8 flex items-center justify-center text-orange-400 hover:bg-orange-50 transition"
                                            >
                                                <Plus size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>

                                        <span className="font-bold text-gray-800 text-sm">
                                            ${(item.price * item.qty).toFixed(2)}
=======
                            className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
                        >
                            {cart.length === 0 && <p className="text-gray-400 dark:text-slate-500 text-sm">Belum ada pesanan</p>}
                            {cart.map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-2xl p-3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</span>
                                        <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => decreaseQty(i)} className="bg-gray-200 dark:bg-slate-600 w-7 h-7 rounded-lg font-bold text-gray-700 dark:text-white">-</button>
                                            <span className="text-gray-900 dark:text-white">{item.qty}</span>
                                            <button onClick={() => increaseQty(i)} className="bg-gray-200 dark:bg-slate-600 w-7 h-7 rounded-lg font-bold text-gray-700 dark:text-white">+</button>
                                        </div>
<<<<<<< HEAD

                                        <span className="font-bold text-sm">
                                            {formatCurrency(item.price * item.qty)}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                                        </span>
=======
                                        <span className="font-bold text-sm text-orange-500">{formatCurrency(item.price * item.qty)}</span>
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                                    </div>
                                </div>
                            ))}
                        </div>

<<<<<<< HEAD
                        {/* ── FOOTER ── */}
                        <div className="px-4 pb-5 pt-3 border-t border-gray-100 space-y-3 bg-white">

                            {/* PAYMENT METHOD */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Pembayaran
                                </p>
=======
                        {/* FOOTER */}
                        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3 bg-gray-50 dark:bg-slate-900/50">
                            <div className="space-y-2">
<<<<<<< HEAD
                                <p className="text-sm font-semibold">Metode Pembayaran</p>

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                                <div className="flex gap-2">
                                    {["Cash", "QRIS", "Debit"].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPayment(method)}
                                            className={`
<<<<<<< HEAD
                                                flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                                                ${payment === method
                                                    ? "bg-orange-500 text-white shadow-md shadow-orange-200 scale-[1.04]"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }
                                            `}
                                        >
                                            <span>{paymentIcons[method]}</span>
                                            <span>{method}</span>
=======
                                                flex-1 py-2 rounded-lg text-xs font-semibold transition
                                                ${payment === method
                                                    ? "bg-white text-orange-500"
                                                    : "bg-white/20 hover:bg-white/30"
                                                }
                                            `}
                                        >
=======
                                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Metode Pembayaran</p>
                                <div className="flex gap-2">
                                    {["Cash", "QRIS", "Debit"].map((method) => (
                                        <button key={method} onClick={() => setPayment(method)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition border ${payment === method ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-orange-300"}`}>
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                                            {method}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                                        </button>
                                    ))}
                                </div>
                            </div>
<<<<<<< HEAD

<<<<<<< HEAD
                            {/* ORDER SUMMARY */}
                            <div className="bg-orange-50 rounded-2xl px-4 py-3 space-y-1.5">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Order type</span>
                                    <span className="font-semibold text-orange-500 flex items-center gap-1">
                                        {orderTypeConfig[orderType].icon}
                                        {orderType}
                                    </span>
                                </div>
                                <div className="border-t border-orange-200 pt-1.5 flex justify-between font-black text-gray-800 text-base">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* PAY BUTTON */}
                            <button
                                onClick={handlePay}
                                className="
                                    w-full bg-gradient-to-r from-orange-500 to-amber-500
                                    hover:from-orange-600 hover:to-amber-600
                                    active:scale-[0.98]
                                    text-white py-4 rounded-2xl font-black text-sm
                                    shadow-lg shadow-orange-200 transition-all duration-200
                                    flex items-center justify-center gap-2
                                "
                            >
                                <span>Bayar · {payment}</span>
                                <span className="flex items-center gap-0.5 bg-white/20 rounded-lg px-2 py-0.5 font-bold text-xs">
                                    ${total.toFixed(2)}
                                    <ChevronRight size={12} />
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
=======
                            {/* TOTAL */}
                            <div className="flex justify-between font-bold text-lg">
=======
                            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                                <span>Total</span>
                                <span className="text-orange-500">{formatCurrency(total)}</span>
                            </div>
                            <button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0 || processing}
                                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50">
                                {processing ? "Memproses..." : "Bayar"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* PAYMENT MODAL — CASH / DEBIT */}
            {showPaymentModal && payment !== "QRIS" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
                        <h3 className="text-xl font-bold">Input Pembayaran</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400">Total Belanja</p>
                            <p className="text-2xl font-bold text-orange-400">{formatCurrency(total)}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Nominal Pembayaran</label>
                            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[#111827] border border-gray-700 text-white text-lg"
                                placeholder="0" min="0" step="1000" autoFocus />
                        </div>
                        {paidAmount && Number(paidAmount) >= total && (
                            <div className="space-y-2 bg-green-900/30 border border-green-600 rounded-xl p-3">
                                <p className="text-sm text-gray-300">Kembalian</p>
                                <p className="text-2xl font-bold text-green-400">{formatCurrency(Number(paidAmount) - total)}</p>
                            </div>
                        )}
                        {paidAmount && Number(paidAmount) < total && (
                            <div className="text-sm text-red-400 bg-red-900/30 border border-red-600 rounded-xl p-3">
                                ⚠️ Nominal kurang {formatCurrency(total - Number(paidAmount))}
                            </div>
                        )}
                        <div className="flex gap-2 pt-4">
                            <button onClick={() => setShowPaymentModal(false)} disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition disabled:opacity-50">Batal</button>
                            <button onClick={handlePay} disabled={!paidAmount || Number(paidAmount) < total || processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50 font-semibold">
                                {processing ? "Memproses..." : "Bayar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PAYMENT MODAL — QRIS */}
            {showPaymentModal && payment === "QRIS" && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-sm text-white space-y-4 shadow-2xl">
                        <div className="text-center">
                            <h3 className="text-xl font-bold">Bayar via QRIS</h3>
                            <p className="text-sm text-gray-400 mt-1">Scan QR di bawah dengan e-wallet</p>
                        </div>
                        <div className="flex justify-center">
                            {qrisImage ? (
                                <img src={`/storage/${qrisImage}`} alt="QRIS" className="w-56 h-56 object-contain rounded-xl border-4 border-white bg-white" />
                            ) : (
                                <div className="w-56 h-56 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-500">
                                    <span className="text-5xl">📷</span>
                                    <p className="text-xs text-center px-4">QR belum diupload. Upload di Pengaturan → Profil Toko</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400">Total yang harus dibayar</p>
                            <p className="text-2xl font-bold text-orange-400">{formatCurrency(total)}</p>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Setelah customer membayar, klik konfirmasi</p>
                        <div className="flex gap-2">
                            <button onClick={() => setShowPaymentModal(false)} disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition disabled:opacity-50">Batal</button>
                            <button onClick={handlePay} disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 font-semibold">
                                {processing ? "Memproses..." : "Konfirmasi Diterima"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATION */}
            {notification && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} text-white rounded-2xl shadow-2xl p-6 max-w-md`}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">{notification.type === "success" ? "✓" : "✕"}</div>
                            <h3 className="text-xl font-bold">{notification.title}</h3>
                        </div>
                        <p className="text-sm opacity-90">{notification.message}</p>
                        {notification.invoice && <p className="text-xs opacity-75 mt-2">Invoice: {notification.invoice}</p>}
                    </div>
                </div>
            )}

            {/* PRINT MODAL */}
            {showPrintModal && <PrintModal data={lastSaleData} onPrint={handlePrintNota} onClose={closePrintModal} formatCurrency={formatCurrency} />}
        </>
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    );
}
