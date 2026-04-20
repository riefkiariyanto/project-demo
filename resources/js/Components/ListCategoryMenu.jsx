import { useRef, useState, useEffect } from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function ListCategoryMenu({ categories }) {
    const scrollRef = useRef();

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(
            el.scrollLeft < el.scrollWidth - el.clientWidth
        );
    };

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;

        el.scrollBy({
            left: direction === "left" ? -200 : 200,
            behavior: "smooth",
        });
    };

    const handleMouseDown = (e) => {
        const el = scrollRef.current;
        if (!el) return;

        setIsDown(true);
        setStartX(e.pageX - el.offsetLeft);
        setScrollLeft(el.scrollLeft);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();

        const el = scrollRef.current;
        if (!el) return;

        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.5;
        el.scrollLeft = scrollLeft - walk;
    };

    const stopDrag = () => setIsDown(false);

    useEffect(() => {
        checkScroll();
    }, []);

    return (
        <div className="relative w-fit max-w-full">
            {/* LEFT BUTTON */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="
                    absolute left-2 top-1/2 -translate-y-1/2 z-10
                    bg-white/30 backdrop-blur-md border border-white/30 
                    hover:bg-white/50 text-orange-500 p-2 rounded-full shadow
                "
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            )}

            {/* RIGHT BUTTON */}
            {canScrollRight && (
                <button
                    onClick={() => scroll("right")}
                    className="
                    absolute right-2 top-1/2 -translate-y-1/2 z-10
                    bg-white/30 backdrop-blur-md border border-white/30 
                    hover:bg-white/50 text-orange-500 p-2 rounded-full shadow
                "
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            )}

            {/* SCROLL AREA */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                onMouseDown={handleMouseDown}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onMouseMove={handleMouseMove}
                className="
                flex gap-6 overflow-x-auto px-1 py-2
                cursor-grab active:cursor-grabbing 
                no-scrollbar select-none
            "
            >
                {categories.map((cat, i) => (
                    <button
                        key={i}
                        className="
                        min-w-[120px] flex-shrink-0
                        bg-orange-400/70 backdrop-blur-md 
                        border border-white/40
                        text-white px-6 py-3 rounded-xl shadow
                        hover:bg-orange-500 transition
                        text-sm font-medium
                    "
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}