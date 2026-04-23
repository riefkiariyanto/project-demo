import { useState, useRef, useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

export default function RiwayatPesanan() {

    // ================= STATE =================
    const [selectedDay, setSelectedDay] = useState("Sen");
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();
    const scrollRef = useRef(null);

    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

    // ================= CLOSE DROPDOWN =================
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ================= DRAG =================
    let isDown = false;
    let startY;
    let scrollTop;

    const handleMouseDown = (e) => {
        isDown = true;
        startY = e.pageY - scrollRef.current.offsetTop;
        scrollTop = scrollRef.current.scrollTop;
    };

    const handleMouseLeave = () => (isDown = false);
    const handleMouseUp = () => (isDown = false);

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const y = e.pageY - scrollRef.current.offsetTop;
        const walk = (y - startY) * 1.5;
        scrollRef.current.scrollTop = scrollTop - walk;
    };

    // ================= DATA =================
    const orders = [
        { id: 1, orderId: "#32133", time: "10:12", total: 2, payment: "Cash", day: "Sen" },
        { id: 2, orderId: "#32134", time: "10:25", total: 1, payment: "QRIS", day: "Sel" },
        { id: 3, orderId: "#32135", time: "10:40", total: 3, payment: "Transfer", day: "Rab" },
        { id: 4, orderId: "#32136", time: "11:00", total: 5, payment: "Cash", day: "Kam" },
        { id: 5, orderId: "#32137", time: "11:15", total: 2, payment: "QRIS", day: "Jum" },
        { id: 6, orderId: "#32138", time: "11:30", total: 4, payment: "Cash", day: "Sen" },
        { id: 7, orderId: "#32139", time: "11:20", total: 4, payment: "Cash", day: "Sen" },
        { id: 8, orderId: "#32140", time: "11:10", total: 4, payment: "Cash", day: "Sen" },
    ];

    const filtered = orders.filter(o => o.day === selectedDay);

    // ================= COLOR =================
    const getPaymentColor = (method) => {
        if (method === "Cash") return "bg-orange-500/20 text-orange-300";
        if (method === "QRIS") return "bg-green-500/20 text-green-300";
        return "bg-blue-500/20 text-blue-300";
    };

    return (
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 border border-white/20 rounded-2xl p-5 h-[300px] flex flex-col select-none">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">

                <h3 className="font-semibold text-white">
                    Riwayat Pesanan
                </h3>

                {/* DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition"
                    >
                        {selectedDay}
                        <span className={`text-[10px] transition ${open ? "rotate-180" : ""}`}>
                            ▼
                        </span>
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-2 w-32 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">

                            {days.map((d) => (
                                <div
                                    key={d}
                                    onClick={() => {
                                        setSelectedDay(d);
                                        setOpen(false);
                                    }}
                                    className={`px-3 py-2 text-xs cursor-pointer transition hover:bg-white/10 ${selectedDay === d
                                        ? "bg-white/10 text-orange-300"
                                        : "text-white/70"
                                        }`}
                                >
                                    {d}
                                </div>
                            ))}

                        </div>
                    )}
                </div>

            </div>

            {/* LIST */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >

                {filtered.length > 0 ? (
                    filtered.map((order) => (
                        <div
                            key={order.id}
                            className="flex items-center bg-white/5 hover:bg-white/10 transition rounded-xl overflow-hidden group"
                        >

                            <div className="flex flex-1 items-center justify-between px-4 py-3">

                                {/* LEFT */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-semibold text-white">
                                        {order.orderId.replace("#", "").slice(-2)}
                                    </div>

                                    <div>
                                        <p className="text-sm text-white font-medium">
                                            {order.orderId}
                                        </p>
                                        <p className="text-xs text-white/50">
                                            {order.time} • {order.total} item
                                        </p>
                                    </div>
                                </div>

                                {/* PAYMENT */}
                                <div className="flex-1 flex justify-center">
                                    <span className={`text-[10px] px-2 py-1 rounded-full ${getPaymentColor(order.payment)}`}>
                                        {order.payment}
                                    </span>
                                </div>

                                {/* ARROW RIGHT */}
                                <div className="text-white/50 group-hover:text-white transition">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </div>

                            </div>

                        </div>
                    ))
                ) : (
                    <div className="text-center text-white/40 text-sm py-10">
                        Tidak ada pesanan
                    </div>
                )}

            </div>

        </div>
    );
}