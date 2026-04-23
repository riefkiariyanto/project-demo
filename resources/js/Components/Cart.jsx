import { useRef, useState, useEffect } from "react";

export default function Cart({ cart, open, setOpen, setCart }) {
    const scrollRef = useRef();

    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

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

    return (
        <div
            className={`
                fixed top-0 right-0 h-full z-60
                transition-all duration-300 ease-in-out
                ${open ? "w-[180px] sm:w-[320px]" : "w-0"}
            `}
        >

            {open && (
                <div
                    style={{
                        transform: `translateX(${dragX}px)`
                    }}
                    className="
                        h-full w-full
                        flex flex-col
                        bg-gradient-to-b from-orange-400 to-orange-500
                        text-white
                        rounded-l-3xl
                        shadow-2xl
                        border-l border-white/20
                        backdrop-blur-xl
                        overflow-hidden
                    "
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >

                    {/* HEADER */}

                    <div className="p-4 border-b border-white/20 flex justify-between items-center">

                        <h2 className="font-bold text-lg">Cart</h2>

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
                        className="
                            flex-1 min-h-0
                            overflow-y-auto
                            p-4 space-y-3
                            cursor-grab active:cursor-grabbing
                            select-none
                            no-scrollbar
                            overscroll-contain
                        "
                    >
                        {cart.length === 0 && (
                            <p className="text-white/70 text-sm">
                                Belum ada pesanan
                            </p>
                        )}

                        {cart.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white/20 rounded-2xl p-3 space-y-2"
                            >
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
                                        <button
                                            onClick={() => decreaseQty(i)}
                                            className="bg-white/30 px-2 rounded"
                                        >
                                            -
                                        </button>

                                        <span>{item.qty}</span>

                                        <button
                                            onClick={() => increaseQty(i)}
                                            className="bg-white/30 px-2 rounded"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="font-bold text-sm">
                                        ${item.price * item.qty}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER */}
                    <div className="p-4 border-t border-white/20 space-y-3">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total}</span>
                        </div>

                        <button className="w-full bg-white text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-100 transition">
                            Bayar
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}