import { useRef, useState, useEffect } from "react";
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

export default function Cart({ cart, open, setOpen, setCart }) {
    const scrollRef = useRef();

    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const [payment, setPayment] = useState("Cash");
    const [orderType, setOrderType] = useState("Dine In");
    const [orderId, setOrderId] = useState("");

    // =========================
    // GENERATE ORDER ID
    // =========================
    const generateOrderId = () => {
        const date = new Date();
        const yy = String(date.getFullYear()).slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        const key = `order-counter-${yy}${mm}${dd}`;
        let counter = parseInt(localStorage.getItem(key) || "0");
        counter += 1;
        localStorage.setItem(key, counter);

        return `#ORD-${yy}${mm}${dd}-${String(counter).padStart(3, "0")}`;
    };

    useEffect(() => {
        if (open && cart.length > 0 && !orderId) {
            setOrderId(generateOrderId());
        }
    }, [open, cart]);

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

    // =========================
    // AUTO CLOSE IF EMPTY
    // =========================
    useEffect(() => {
        if (cart.length === 0) setOpen(false);
    }, [cart]);

    // =========================
    // CART ACTIONS
    // =========================
    const increaseQty = (i) =>
        setCart((prev) =>
            prev.map((item, index) =>
                index === i ? { ...item, qty: item.qty + 1 } : item
            )
        );

    const decreaseQty = (i) =>
        setCart((prev) =>
            prev
                .map((item, index) =>
                    index === i ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0)
        );

    const removeItem = (i) =>
        setCart((prev) => prev.filter((_, index) => index !== i));

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // =========================
    // HANDLE PAY
    // =========================
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
                        <div
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={stopDrag}
                            onMouseLeave={stopDrag}
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
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── FOOTER ── */}
                        <div className="px-4 pb-5 pt-3 border-t border-gray-100 space-y-3 bg-white">

                            {/* PAYMENT METHOD */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Pembayaran
                                </p>
                                <div className="flex gap-2">
                                    {["Cash", "QRIS", "Debit"].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPayment(method)}
                                            className={`
                                                flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                                                ${payment === method
                                                    ? "bg-orange-500 text-white shadow-md shadow-orange-200 scale-[1.04]"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }
                                            `}
                                        >
                                            <span>{paymentIcons[method]}</span>
                                            <span>{method}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

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
    );
}