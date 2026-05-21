<<<<<<< HEAD
<<<<<<< HEAD
import { useRef, useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import ListCategoryMenu from "@/Components/ListCategoryMenu";

export default function Menu({ onAdd, openCart }) {
    const scrollRef = useRef();
=======
import { useRef, useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
=======
import { useState, useMemo } from "react";
import { MagnifyingGlassIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
import ListCategoryMenu from "@/Components/ListCategoryMenu";

import { useDarkMode } from "@/hooks/useDarkMode";

export default function Menu({ onAdd, openCart, setOpenCart, cart = [], products = [], categories = [] }) {
    const { isDark } = useDarkMode();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState("");
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d

<<<<<<< HEAD
    // DRAG STATE
    const [isDown, setIsDown] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    // START DRAG
    const handleMouseDown = (e) => {
        const el = scrollRef.current;
        if (!el) return;

        setIsDown(true);
        setStartY(e.pageY);
        setScrollTop(el.scrollTop);
    };

    // STOP DRAG
    const stopDrag = () => setIsDown(false);

    // DRAG MOVE (SMOOTH)
    const handleMouseMove = (e) => {
        if (!isDown) return;

        const el = scrollRef.current;
        if (!el) return;

        e.preventDefault();

        const walk = (e.pageY - startY) * 0.8; // 🔥 lebih stabil (no mantul)
        el.scrollTop = scrollTop - walk;
    };

    // GLOBAL MOUSE UP (biar tidak nyangkut)
    useEffect(() => {
        const handleUp = () => setIsDown(false);
        window.addEventListener("mouseup", handleUp);
        return () => window.removeEventListener("mouseup", handleUp);
    }, []);

<<<<<<< HEAD
=======
    // Filter products by category and search
=======
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory) {
            result = result.filter((product) => product.category_id === selectedCategory);
        }
        if (search) {
            result = result.filter((product) =>
                (product.name || "").toLowerCase().includes(search.toLowerCase())
            );
        }
        return result;
    }, [products, selectedCategory, search]);

    const categoryOptions = useMemo(() => {
        return categories.filter((cat) => products.some((p) => p.category_id === cat.id));
    }, [categories, products]);

    const getInitials = (name) => {
        return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    return (
        <div className={`w-full rounded-2xl px-1 py-1 border h-full min-h-0 flex flex-col ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200 shadow-sm"}`}>
            {/* HEADER */}
            <div className="flex px-2 justify-between items-center mb-2 gap-2">
                <h2 className={`text-xl font-bold shrink-0 ${isDark ? "text-white" : "text-gray-900"}`}>Semua menu</h2>
                <div className={`flex items-center rounded-full px-2 py-1 flex-1 ${isDark ? "bg-slate-700" : "bg-gray-100"}`}>
                    <input
                        placeholder="Search menu..."
<<<<<<< HEAD
=======
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
<<<<<<< HEAD
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                        className="bg-transparent w-full text-orange-400 font-semibold placeholder-orange-400 border-0 outline-none focus:ring-0 focus:outline-none" />
                    <MagnifyingGlassIcon className="w-6 h-6 text-orange-500 drop-shadow-sm " />
=======
                        className={`bg-transparent w-full font-semibold border-0 outline-none focus:ring-0 focus:outline-none ${isDark ? "text-white placeholder-slate-400" : "text-gray-700 placeholder-gray-400"}`}
                    />
                    <MagnifyingGlassIcon className="w-6 h-6 text-orange-500 drop-shadow-sm" />
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                </div>
                {/* Cart toggle — desktop only */}
                {setOpenCart && (
                    <button
                        onClick={() => setOpenCart(!openCart)}
                        className="hidden sm:flex relative shrink-0 items-center justify-center w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition"
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-500 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {cart.reduce((s, i) => s + i.qty, 0)}
                            </span>
                        )}
                    </button>
                )}
            </div>

<<<<<<< HEAD
<<<<<<< HEAD
            <ListCategoryMenu categories={[
                'ayam',
                'sapi',
                'kambing',
                'ikan',
                'udang',
                'cumi',
                'sayur',
                'mie',
                'nasi',
                'minuman',
                'ayam',
                'sapi',
                'kambing',
                'ikan',
                'udang',
                'cumi',
                'sayur',
                'mie',
                'nasi',
                'minuman'
            ]} />
=======
            <ListCategoryMenu 
                categories={categoryOptions} 
=======
            <ListCategoryMenu
                categories={categoryOptions}
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d

            {/* SCROLL AREA */}
            <div
                className="flex-1 overflow-y-auto px-3 pb-2 no-scrollbar overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
<<<<<<< HEAD
<<<<<<< HEAD
                <div className="grid px-4 py-4 grid-cols-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white/40 backdrop-blur-md rounded-2xl p-3 shadow-lg hover:scale-105 transition"
                        >
                            <div className="relative h-36 flex items-center justify-center bg-gradient-to-br from-orange-300 to-orange-500 rounded-xl text-white text-2xl font-bold mb-2">

                                <span className="absolute top-2 right-2 bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                                    Available
                                </span>

                                NS
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="text-xs text-black font-semibold">
                                    Nasi goreng
                                </div>

                                <div className="text-black font-bold text-sm">
                                    $600
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    onAdd({
                                        name: "Nasi goreng",
                                        price: 600,
                                    })
                                }
                                className="mt-2 w-full bg-orange-500 text-white py-2 rounded-lg"
                            >
                                + Add
                            </button>
                        </div>
                    ))}
=======
                <div className="grid px-4 py-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
=======
                <div className="grid py-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 min-w-0">
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => product.available_stock > 0 && onAdd({ id: product.id, name: product.name, price: product.selling_price, selling_price: product.selling_price })}
                                className={`rounded-2xl p-2 shadow-sm hover:scale-105 transition flex flex-col border ${isDark ? "bg-slate-700 border-slate-600" : "bg-white border-gray-100"} ${product.available_stock > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                                style={{ touchAction: 'manipulation' }}
                            >
                                {/* IMAGE */}
                                <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-orange-300 to-orange-500 rounded-xl text-white text-2xl font-bold overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={`/storage/${product.image}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{getInitials(product.name)}</span>
                                    )}
                                    <span className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                        product.available_stock > 0
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-600"
                                    }`}>
                                        {product.available_stock > 0 ? "Ada" : "Habis"}
                                    </span>
                                </div>

                                {/* INFO — nama dan harga stacked vertikal */}
                                <div className="mt-1.5 flex-1 space-y-0.5 px-0.5">
                                    <p className={`text-xs font-semibold line-clamp-2 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {product.name}
                                    </p>
                                    <p className="text-orange-600 font-bold text-xs leading-tight">
                                        {formatPrice(product.selling_price)}
                                    </p>
                                </div>

                                {/* BUTTON */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); product.available_stock > 0 && onAdd({ id: product.id, name: product.name, price: product.selling_price, selling_price: product.selling_price }); }}
                                    disabled={product.available_stock <= 0}
                                    style={{ touchAction: 'manipulation' }}
                                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-semibold transition ${
                                        product.available_stock > 0
                                            ? "bg-orange-500 text-white hover:bg-orange-600"
                                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    }`}
                                >
                                    {product.available_stock > 0 ? "+ Add" : "Habis"}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center py-8 text-gray-400">
                            <p>Tidak ada menu yang ditemukan</p>
                        </div>
                    )}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                </div>
            </div>
        </div>
    );
}