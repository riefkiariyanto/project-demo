import { useRef, useState } from "react";
import {
    PencilSquareIcon,
    TrashIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function StockMenu() {

    const stock = [
        { id: 1234, name: "Nasi goreng", price: 20000, stock: 12, category: "Makanan" },
        { id: 1235, name: "Mie ayam", price: 15000, stock: 8, category: "Makanan" },
        { id: 1236, name: "Es teh", price: 5000, stock: 20, category: "Minuman" },
        { id: 1237, name: "Kopi susu", price: 12000, stock: 0, category: "Minuman" },
        { id: 1238, name: "Ayam geprek", price: 18000, stock: 5, category: "Makanan" },
    ];

    // ================= DRAG SCROLL =================
    const scrollRef = useRef(null);
    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const handleMouseDown = (e) => {
        if (e.target.closest("button")) return;

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
        const walk = (e.pageY - startY) * 1;
        el.scrollTop = scrollTop - walk;
    };

    const stopDrag = () => setIsDown(false);

    return (
        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Stock Menu</h2>

                <button className="text-xs border border-gray-600 px-3 py-1 rounded-full hover:bg-gray-700 transition">
                    Sort by ▾
                </button>
            </div>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-8 px-4 pb-3 text-xs text-gray-400 border-b border-gray-700">
                <span></span>
                <span>ID</span>
                <span>Nama</span>
                <span>Kategori</span>
                <span>Harga</span>
                <span>Stock</span>
                <span>Status</span>
                <span className="text-right">Aksi</span>
            </div>

            {/* LIST */}
            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                className="divide-y divide-gray-800 max-h-[400px] overflow-y-auto cursor-grab active:cursor-grabbing select-none"
            >
                {stock.map((item, index) => {
                    const initials = item.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                    return (
                        <div
                            key={item.id + index}
                            className="grid grid-cols-8 items-center px-4 py-3 hover:bg-gray-800/40 transition group"
                        >

                            {/* INITIAL */}
                            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                                {initials}
                            </div>

                            {/* ID */}
                            <span className="text-xs text-gray-300">
                                {item.id}
                            </span>

                            {/* NAME */}
                            <span className="text-sm font-medium text-white">
                                {item.name}
                            </span>

                            {/* CATEGORY */}
                            <span className={`text-[11px] px-2 py-1 rounded-md font-semibold w-fit
                                ${item.category === "Makanan"
                                    ? "bg-blue-600 text-white"
                                    : "bg-purple-600 text-white"
                                }`}
                            >
                                {item.category}
                            </span>

                            {/* PRICE */}
                            <span className="text-xs text-gray-300">
                                Rp {item.price.toLocaleString("id-ID")}
                            </span>

                            {/* STOCK */}
                            <span
                                className={`text-sm font-bold ${item.stock === 0
                                        ? "text-red-400"
                                        : item.stock <= 5
                                            ? "text-yellow-400"
                                            : "text-white"
                                    }`}
                            >
                                {item.stock}
                            </span>

                            {/* STATUS */}
                            <div>
                                {item.stock === 0 ? (
                                    <span className="text-[11px] px-2 py-1 rounded-md bg-red-600 text-white font-semibold">
                                        Habis
                                    </span>
                                ) : item.stock <= 5 ? (
                                    <span className="text-[11px] px-2 py-1 rounded-md bg-yellow-400 text-black font-semibold">
                                        Low
                                    </span>
                                ) : (
                                    <span className="text-[11px] px-2 py-1 rounded-md bg-green-600 text-white font-semibold">
                                        Ready
                                    </span>
                                )}
                            </div>

                            {/* ACTION */}
                            <div className="flex justify-end items-center gap-2">
                                <button className="p-1 hover:bg-gray-700 rounded text-blue-400">
                                    <PencilSquareIcon className="w-4 h-4" />
                                </button>

                                <button className="p-1 hover:bg-gray-700 rounded text-red-400">
                                    <TrashIcon className="w-4 h-4" />
                                </button>

                                <ChevronRightIcon className="w-4 h-4 text-gray-500 group-hover:text-white" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* BUTTON */}
            <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 font-semibold transition">
                + Tambah Menu
            </button>
        </div>
    );
}