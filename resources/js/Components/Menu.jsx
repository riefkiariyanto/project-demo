import { useRef, useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import ListCategoryMenu from "@/Components/ListCategoryMenu";

export default function Menu({ onAdd, openCart }) {
    const scrollRef = useRef();

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

    return (
        <div className=" bg-white/30 backdrop-blur-xl rounded-2xl p-3 border border-white/30 max-h-[800px] flex flex-col">
            {/* HEADER */}
            <div className="flex px-6 justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                    Semua menu
                </h2>

                <div className="flex items-center bg-white/30 rounded-full px-3 py-1">
                    <input
                        placeholder="Search menu..."
                        className="bg-transparent w-full text-orange-400 font-semibold placeholder-orange-400 border-0 outline-none focus:ring-0 focus:outline-none" />
                    <MagnifyingGlassIcon className="w-6 h-6 text-orange-500 drop-shadow-sm " />
                </div>
            </div>

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

            {/* SCROLL AREA */}
            <div
                ref={scrollRef}
                onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                }}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onMouseMove={handleMouseMove}
                className="
                    flex-1
                    overflow-y-auto pr-3 pl-1 pb-2
                    no-scrollbar
                    cursor-grab active:cursor-grabbing
                    select-none
                    overscroll-contain
                "
            >
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
                </div>
            </div>
        </div>
    );
}