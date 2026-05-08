import { useRef, useState, useEffect } from "react";

export default function Cart({ cart, open, setOpen, setCart, qrisImage = null, isMobile = false }) {
    const scrollRef = useRef();

    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    // 🔥 PAYMENT
    const [payment, setPayment] = useState("Cash");
    const [paidAmount, setPaidAmount] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // 🔥 ORDER ID
    const [orderId, setOrderId] = useState("");

    // 🔥 NOTIFICATION
    const [notification, setNotification] = useState(null);
    const [processing, setProcessing] = useState(false);

    // orderId is populated from server invoice_no after successful payment

    // =========================
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
    // DRAG SCROLL
    // =========================
    const handleMouseDown = (e) => {
        const el = scrollRef.current;
        if (!el) return;

        setIsDown(true);
        setStartY(e.pageY);
        setScrollTop(el.scrollTop);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;

        const el = scrollRef.current;
        if (!el) return;

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
    // desktop side-panel swipe (horizontal)
    const touchStartX = useRef(0);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const diff = e.touches[0].clientX - touchStartX.current;
        if (diff > 0) setDragX(diff);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragX > 120) setOpen(false);
        setDragX(0);
    };

    // mobile bottom-sheet: two-position drag (half ↔ full, close on drag down from half)
    const touchStartY = useRef(0);
    const [dragY, setDragY] = useState(0);       // live drag offset (px), positive = down
    const [sheetFull, setSheetFull] = useState(false); // false = half, true = full
    const [isDraggingY, setIsDraggingY] = useState(false);

    const handleSheetTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
        setIsDraggingY(true);
    };

    const handleSheetTouchMove = (e) => {
        if (!isDraggingY) return;
        const diff = e.touches[0].clientY - touchStartY.current;
        // full mode: allow drag down; half mode: allow drag in both directions
        if (sheetFull) {
            if (diff > 0) setDragY(diff);          // only drag down in full
        } else {
            setDragY(diff);                          // both up and down in half
        }
    };

    const handleSheetTouchEnd = () => {
        setIsDraggingY(false);
        if (sheetFull) {
            if (dragY > 100) setSheetFull(false);  // full → half
        } else {
            if (dragY < -60) setSheetFull(true);   // half → full (drag up)
            else if (dragY > 100) setOpen(false);  // half → close (drag down)
        }
        setDragY(0);
    };

    // =========================
    // AUTO CLOSE IF EMPTY
    // =========================
    useEffect(() => {
        if (cart.length === 0) { setOpen(false); setSheetFull(false); }
    }, [cart]);

    // =========================
    // ACTION
    // =========================
    const increaseQty = (i) => {
        setCart((prev) =>
            prev.map((item, index) =>
                index === i ? { ...item, qty: item.qty + 1 } : item
            )
        );
    };

    const decreaseQty = (i) => {
        setCart((prev) =>
            prev
                .map((item, index) =>
                    index === i ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0)
        );
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

    // =========================
    // HANDLE PAY
    // =========================
    const handlePay = async () => {
        const isQris = payment === "QRIS";
        const paid = isQris ? total : Number(paidAmount) || 0;

        if (!isQris && paid < total) {
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
                }),
            });

            const data = await response.json();

            if (data.success) {
                setOrderId(data.invoice_no ?? "");
                setNotification({
                    type: "success",
                    title: "Pembayaran Berhasil!",
                    message: `Kembalian: ${formatCurrency(data.change)}`,
                    invoice: data.invoice_no,
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

    if (isMobile) {
        return (
            <>
                {/* MOBILE: full-screen bottom sheet */}
                {open && (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end">
                        {/* backdrop */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setOpen(false)}
                        />
                        <div
                            style={{
                                transform: `translateY(${dragY > 0 ? dragY : 0}px)`,
                                transition: isDraggingY ? "none" : "transform 0.3s ease, height 0.3s ease, max-height 0.3s ease",
                            }}
                            className={`relative flex flex-col bg-gradient-to-b from-orange-400 to-orange-500 text-white rounded-t-3xl shadow-2xl
                                ${sheetFull ? "h-[92vh]" : "max-h-[60vh]"}`}
                            onTouchStart={handleSheetTouchStart}
                            onTouchMove={handleSheetTouchMove}
                            onTouchEnd={handleSheetTouchEnd}
                        >
                            {/* drag handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-white/40" />
                            </div>

                            {/* HEADER */}
                            <div className="px-5 py-3 border-b border-white/20 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-lg">Cart</h2>
                                    {orderId && <p className="text-xs text-white/70">{orderId}</p>}
                                </div>
                                <button onClick={() => setOpen(false)} className="hover:bg-white/20 px-2 py-1 rounded-lg">✕</button>
                            </div>

                            {/* LIST */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                                {cart.map((item, i) => (
                                    <div key={i} className="bg-white/20 rounded-2xl p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-sm">{item.name}</span>
                                            <button onClick={() => removeItem(i)} className="text-xs text-red-200 hover:text-red-400">Hapus</button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 items-center">
                                                <button onClick={() => decreaseQty(i)} className="bg-white/30 w-7 h-7 rounded-lg font-bold">-</button>
                                                <span>{item.qty}</span>
                                                <button onClick={() => increaseQty(i)} className="bg-white/30 w-7 h-7 rounded-lg font-bold">+</button>
                                            </div>
                                            <span className="font-bold text-sm">{formatCurrency(item.price * item.qty)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER */}
                            <div className="p-4 pb-24 border-t border-white/20 space-y-3">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold">Metode Pembayaran</p>
                                    <div className="flex gap-2">
                                        {["Cash", "QRIS", "Debit"].map((method) => (
                                            <button key={method} onClick={() => setPayment(method)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${payment === method ? "bg-white text-orange-500" : "bg-white/20 hover:bg-white/30"}`}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                <button onClick={() => setShowPaymentModal(true)}
                                    disabled={cart.length === 0 || processing}
                                    className="w-full bg-white text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-100 transition disabled:opacity-50">
                                    {processing ? "Memproses..." : "Bayar"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
                                <div className="bg-green-900/30 border border-green-600 rounded-xl p-3">
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
                                        <p className="text-xs text-center px-4">QR belum diupload. Upload di Kelola Toko → Toko</p>
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
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] ${notification.type === "success" ? "bg-green-500" : "bg-red-500"} text-white rounded-2xl shadow-2xl p-6 max-w-md`}>
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
            </>
        );
    }

    return (
        <>
            <div
                className={`
                    fixed top-0 right-0 h-full z-50
                    transition-all duration-300 ease-in-out
                    ${open ? "w-[320px]" : "w-0"}
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
                        <div
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={stopDrag}
                            onMouseLeave={stopDrag}
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
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-white/20 space-y-3">

                            {/* PAYMENT METHOD */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Metode Pembayaran</p>

                                <div className="flex gap-2">
                                    {["Cash", "QRIS", "Debit"].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPayment(method)}
                                            className={`
                                                flex-1 py-2 rounded-lg text-xs font-semibold transition
                                                ${payment === method
                                                    ? "bg-white text-orange-500"
                                                    : "bg-white/20 hover:bg-white/30"
                                                }
                                            `}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

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

            {/* PAYMENT MODAL — CASH / DEBIT */}
            {showPaymentModal && payment !== "QRIS" && (
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

            {/* PAYMENT MODAL — QRIS */}
            {showPaymentModal && payment === "QRIS" && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-sm text-white space-y-4 shadow-2xl">
                        <div className="text-center">
                            <h3 className="text-xl font-bold">Bayar via QRIS</h3>
                            <p className="text-sm text-gray-400 mt-1">Scan QR di bawah dengan e-wallet</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center">
                            {qrisImage ? (
                                <img
                                    src={`/storage/${qrisImage}`}
                                    alt="QRIS"
                                    className="w-56 h-56 object-contain rounded-xl border-4 border-white bg-white"
                                />
                            ) : (
                                <div className="w-56 h-56 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-500">
                                    <span className="text-5xl">📷</span>
                                    <p className="text-xs text-center px-4">QR belum diupload. Upload di Kelola Toko → Toko</p>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400">Total yang harus dibayar</p>
                            <p className="text-2xl font-bold text-orange-400">{formatCurrency(total)}</p>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            Setelah customer membayar, klik konfirmasi
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                            >
                                {processing ? "Memproses..." : "Konfirmasi Diterima"}
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
    );
}