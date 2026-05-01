import { useRef, useState, useEffect } from "react";
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

export default function Cart({ cart, open, setOpen, setCart }) {
    const scrollRef = useRef();

    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

<<<<<<< HEAD
    const [payment, setPayment] = useState("Cash");
    const [orderType, setOrderType] = useState("Dine In");
    const [orderId, setOrderId] = useState("");

=======
    // 🔥 PAYMENT
    const [payment, setPayment] = useState("Cash");
    const [paidAmount, setPaidAmount] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // 🔥 ORDER ID
    const [orderId, setOrderId] = useState("");

    // 🔥 NOTIFICATION
    const [notification, setNotification] = useState(null);
    const [processing, setProcessing] = useState(false);

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
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
        setIsDown(true);
        setStartY(e.pageY);
        setScrollTop(el.scrollTop);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
<<<<<<< HEAD
        const el = scrollRef.current;
        if (!el) return;
=======

        const el = scrollRef.current;
        if (!el) return;

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        e.preventDefault();
        const walk = (e.pageY - startY) * 0.8;
        el.scrollTop = scrollTop - walk;
    };

    const stopDrag = () => setIsDown(false);

    useEffect(() => {
        const up = () => setIsDown(false);
        window.addEventListener("mouseup", up);
        return () => window.removeEventListener("mouseup", up);
    }, []);

    // =========================
    // SWIPE CLOSE (MOBILE)
    // =========================
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
=======

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        const diff = e.touches[0].clientX - touchStartX.current;
        if (diff > 0) setDragX(diff);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
<<<<<<< HEAD
=======

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        if (dragX > 120) setOpen(false);
        setDragX(0);
    };

    // =========================
    // AUTO CLOSE IF EMPTY
    // =========================
    useEffect(() => {
        if (cart.length === 0) setOpen(false);
    }, [cart]);

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
        setCart((prev) =>
            prev
                .map((item, index) =>
                    index === i ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0)
        );
<<<<<<< HEAD

    const removeItem = (i) =>
        setCart((prev) => prev.filter((_, index) => index !== i));

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
=======
    };

    const removeItem = (i) => {
        setCart((prev) => prev.filter((_, index) => index !== i));
    };

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

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
    const handlePay = async () => {
        const paid = Number(paidAmount) || 0;

        if (paid < total) {
            setNotification({
                type: "error",
                title: "Pembayaran Kurang!",
                message: `Kurang: ${formatCurrency(total - paid)}`,
            });
            return;
        }

        setProcessing(true);

        const saleItems = cart.map((item) => ({
            product_id: item.id,
            qty: item.qty,
            price: item.price,
        }));

        try {
            const response = await fetch("/sales", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
                body: JSON.stringify({
                    items: saleItems,
                    payment_method: payment,
                    paid_amount: paid,
                    subtotal: total,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const change = paid - total;
                setNotification({
                    type: "success",
                    title: "Pembayaran Berhasil!",
                    message: `Kembalian: ${formatCurrency(change)}`,
                    invoice: orderId,
                });

                // Reset everything
                setTimeout(() => {
                    setCart([]);
                    setOrderId("");
                    setPayment("Cash");
                    setPaidAmount("");
                    setShowPaymentModal(false);
                    setOpen(false);
                }, 1500);
            } else {
                setNotification({
                    type: "error",
                    title: "Pembayaran Gagal!",
                    message: data.message || "Terjadi kesalahan, coba lagi",
                });
            }
        } catch (error) {
            console.error("Payment error:", error);
            setNotification({
                type: "error",
                title: "Pembayaran Gagal!",
                message: error.message || "Terjadi kesalahan jaringan",
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div
                className={`
                    fixed top-0 right-0 h-full z-50
                    transition-all duration-300 ease-in-out
                    ${open ? "w-[180px] sm:w-[320px]" : "w-0"}
                `}
            >
                {open && (
                    <div
                        style={{ transform: `translateX(${dragX}px)` }}
                        className="
                            h-full w-full flex flex-col
                            bg-gradient-to-b from-orange-400 to-orange-500
                            text-white rounded-l-3xl shadow-2xl
                            border-l border-white/20 backdrop-blur-xl overflow-hidden
                        "
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >

                        {/* HEADER */}
                        <div className="p-4 border-b border-white/20 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg">Cart</h2>
                                {orderId && (
                                    <p className="text-xs text-white/70">{orderId}</p>
                                )}
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="hover:bg-white/20 px-2 py-1 rounded-lg"
                            >
                                ✕
                            </button>
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
                            {cart.length === 0 && (
                                <p className="text-white/70 text-sm">
                                    Belum ada pesanan
                                </p>
                            )}

                            {cart.map((item, i) => (
                                <div key={i} className="bg-white/20 rounded-2xl p-3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-sm">
                                            {item.name}
                                        </span>

                                        <button
                                            onClick={() => removeItem(i)}
                                            className="text-xs text-red-200 hover:text-red-400"
                                        >
                                            Hapus
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <button onClick={() => decreaseQty(i)} className="bg-white/30 px-2 rounded">-</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => increaseQty(i)} className="bg-white/30 px-2 rounded">+</button>
                                        </div>

                                        <span className="font-bold text-sm">
                                            {formatCurrency(item.price * item.qty)}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                                        </span>
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
                        <div className="p-4 border-t border-white/20 space-y-3">

                            {/* PAYMENT METHOD */}
                            <div className="space-y-2">
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
                                            {method}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            {/* PAY */}
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                disabled={cart.length === 0 || processing}
                                className="w-full bg-white text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-100 transition disabled:opacity-50"
                            >
                                {processing ? "Memproses..." : "Bayar"}
                            </button>

                        </div>

                    </div>
                )}
            </div>

            {/* PAYMENT INPUT MODAL */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
                        <h3 className="text-xl font-bold">Input Pembayaran</h3>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-400">Total Belanja</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {formatCurrency(total)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Nominal Pembayaran</label>
                            <input
                                type="number"
                                value={paidAmount}
                                onChange={(e) => setPaidAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[#111827] border border-gray-700 text-white text-lg"
                                placeholder="0"
                                min="0"
                                step="1000"
                                autoFocus
                            />
                        </div>

                        {paidAmount && Number(paidAmount) >= total && (
                            <div className="space-y-2 bg-green-900/30 border border-green-600 rounded-xl p-3">
                                <p className="text-sm text-gray-300">Kembalian</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {formatCurrency(Number(paidAmount) - total)}
                                </p>
                            </div>
                        )}

                        {paidAmount && Number(paidAmount) < total && (
                            <div className="text-sm text-red-400 bg-red-900/30 border border-red-600 rounded-xl p-3">
                                ⚠️ Nominal kurang {formatCurrency(total - Number(paidAmount))}
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={!paidAmount || Number(paidAmount) < total || processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50 font-semibold"
                            >
                                {processing ? "Memproses..." : "Bayar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS/ERROR NOTIFICATION */}
            {notification && (
                <div
                    className={`
                        fixed top-4 left-1/2 -translate-x-1/2 z-[70]
                        animate-in fade-in slide-in-from-top-4 duration-300
                        ${notification.type === "success"
                            ? "bg-green-500"
                            : "bg-red-500"
                        } 
                        text-white rounded-2xl shadow-2xl p-6 max-w-md
                    `}
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">
                                {notification.type === "success" ? "✓" : "✕"}
                            </div>
                            <h3 className="text-xl font-bold">
                                {notification.title}
                            </h3>
                        </div>
                        <p className="text-sm opacity-90">
                            {notification.message}
                        </p>
                        {notification.invoice && (
                            <p className="text-xs opacity-75 mt-2">
                                Invoice: {notification.invoice}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    );
}