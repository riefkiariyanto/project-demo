import { useRef, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    PencilSquareIcon,
    TrashIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function KelolaToko() {
    const stock = [
        { id: 1234, name: "Nasi goreng", price: 20000, stock: 12 },
        { id: 1235, name: "Mie ayam", price: 15000, stock: 8 },
        { id: 1236, name: "Es teh", price: 5000, stock: 20 },
        { id: 1237, name: "Kopi susu", price: 12000, stock: 0 },
        { id: 1238, name: "Ayam geprek", price: 18000, stock: 5 },
    ];

    // ================= DRAG =================
    const scrollRef = useRef(null);
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

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Toko" />

            <div className="p-6 text-white">

                {/* TITLE */}
                <h1 className="text-3xl font-bold mb-4">
                    Laporan Stock
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* ================= LEFT ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* SUMMARY */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4"
                                >
                                    <p className="text-sm text-gray-400">Total</p>
                                    <p className="text-xl font-bold mt-1">
                                        $3.630
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                    Stock Menu
                                </h2>

                                <button className="text-xs border border-gray-600 px-3 py-1 rounded-full hover:bg-gray-700 transition">
                                    Sort by ▾
                                </button>
                            </div>

                            {/* TABLE HEADER */}
                            <div className="grid grid-cols-8 px-4 pb-2 text-xs text-gray-400 border-b border-gray-700">
                                <span></span>
                                <span>ID</span>
                                <span>Nama</span>
                                <span>Harga</span>
                                <span>Stock</span>
                                <span>Status</span>
                                <span>Aksi</span>
                            </div>

                            {/* LIST */}
                            <div
                                ref={scrollRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={stopDrag}
                                onMouseLeave={stopDrag}
                                className="space-y-2 max-h-[400px] overflow-y-auto cursor-grab active:cursor-grabbing mt-2"
                            >
                                {stock.map((item) => {
                                    const initials = item.name
                                        .split(" ")
                                        .map((w) => w[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-8 items-center bg-[#111827] hover:bg-[#1f2937] px-4 py-3 rounded-xl transition group"
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
                                                    <span className="text-[11px] px-2 py-1 rounded-lg bg-red-600 text-white font-semibold">
                                                        Habis
                                                    </span>
                                                ) : item.stock <= 5 ? (
                                                    <span className="text-[11px] px-2 py-1 rounded-lg bg-yellow-400 text-black font-semibold">
                                                        Low
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] px-2 py-1 rounded-lg bg-green-600 text-white font-semibold">
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
                    </div>

                    {/* ================= RIGHT ================= */}
                    <div className="space-y-6">

                        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4 h-[300px]">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <div className="border-t border-gray-700 mt-2" />
                        </div>

                        <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4 h-[300px]">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <div className="border-t border-gray-700 mt-2" />
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}