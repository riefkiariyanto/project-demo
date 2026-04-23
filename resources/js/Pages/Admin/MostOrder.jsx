import { useState, useRef, useEffect } from "react";

export default function MostOrder({ orders = [] }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("Today");
    const dropdownRef = useRef();

    const options = ["Today", "Weekly", "Monthly"];

    // Close dropdown saat klik luar
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-[1px] rounded-2xl">
            <div className="bg-[#1e1e1e]/80 rounded-2xl p-5">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-lg tracking-tight">
                        Most Order
                    </h3>

                    {/* DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition border border-white/20"
                        >
                            {selected}
                            <span
                                className={`text-[10px] transition-transform ${open ? "rotate-180" : ""
                                    }`}
                            >
                                ▼
                            </span>
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-28 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                                {options.map((item) => (
                                    <div
                                        key={item}
                                        onClick={() => {
                                            setSelected(item);
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-2 text-xs cursor-pointer transition hover:bg-white/10 ${selected === item
                                            ? "bg-white/10 text-orange-400"
                                            : ""
                                            }`}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* LIST */}
                <div className="space-y-3">
                    {orders.length > 0 ? (
                        orders.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-stretch bg-white/5 hover:bg-white/10 transition rounded-xl overflow-hidden group"
                            >

                                {/* ICON KIRI */}
                                <div className="w-14 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold text-lg rounded-l-xl">
                                    {item.name?.charAt(0) || "N"}
                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 px-4 py-3">
                                    <div className="grid grid-cols-4 gap-4 text-sm">

                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase">
                                                Name
                                            </p>
                                            <p className="font-medium truncate">
                                                {item.name}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase">
                                                Price
                                            </p>
                                            <p>${item.price}</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase">
                                                Orders
                                            </p>
                                            <p>{item.total}x</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase">
                                                Growth
                                            </p>
                                            <p className="text-green-400 font-medium">
                                                +{item.growth}%
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                {/* ARROW KANAN */}
                                <div className="w-12 flex items-center justify-center bg-orange-500/80 group-hover:bg-orange-500 transition text-white rounded-r-xl">
                                    →
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="text-center text-white/40 py-10 text-sm">
                            Tidak ada data pesanan
                        </div>
                    )}
                </div>

                {/* BUTTON */}
                <button className="mt-5 w-full border border-white/20 rounded-lg py-2 text-sm hover:bg-white/10 transition">
                    View All
                </button>

            </div>
        </div>
    );
}