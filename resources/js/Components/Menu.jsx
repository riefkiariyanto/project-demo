import { useState, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import ListCategoryMenu from "@/Components/ListCategoryMenu";

export default function Menu({ onAdd, openCart, products = [], categories = [] }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState("");

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

    return (
        <div className="w-full bg-white/30 backdrop-blur-xl rounded-2xl px-1 py-1 border border-white/20 h-full min-h-0 flex flex-col">
            {/* HEADER */}
            <div className="flex px-2 justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">Semua menu</h2>
                <div className="flex items-center bg-white/30 rounded-full px-2 py-1">
                    <input
                        placeholder="Search menu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent w-full text-orange-400 font-semibold placeholder-orange-400 border-0 outline-none focus:ring-0 focus:outline-none"
                    />
                    <MagnifyingGlassIcon className="w-6 h-6 text-orange-500 drop-shadow-sm" />
                </div>
            </div>

            <ListCategoryMenu
                categories={categoryOptions}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* SCROLL AREA */}
            <div
                className="flex-1 overflow-y-auto px-3 pb-2 no-scrollbar overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
                <div className="grid py-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 min-w-0">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white/40 backdrop-blur-md rounded-2xl p-2 shadow-lg hover:scale-105 transition flex flex-col"
                                style={{ touchAction: 'pan-y' }}
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
                                    <p className="text-xs text-black font-semibold line-clamp-2 leading-tight">
                                        {product.name}
                                    </p>
                                    <p className="text-orange-600 font-bold text-xs leading-tight">
                                        {formatPrice(product.selling_price)}
                                    </p>
                                </div>

                                {/* BUTTON */}
                                <button
                                    onClick={() => onAdd({
                                        id: product.id,
                                        name: product.name,
                                        price: product.selling_price,
                                        selling_price: product.selling_price,
                                    })}
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
                </div>
            </div>
        </div>
    );
}