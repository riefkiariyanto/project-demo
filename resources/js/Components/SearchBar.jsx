import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function SearchBar({ onSearch }) {
    const [keyword, setKeyword] = useState("");

    const handleChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleSearch = () => {
        onSearch && onSearch(keyword);
    };

    return (
        <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-1 border border-white/30 flex items-center">

            {/* INPUT */}
            <input
                type="text"
                value={keyword}
                onChange={handleChange}
                placeholder="Search menu..."
                className="
                    bg-transparent
                    w-full
                    min-w-0
                    px-3

                    text-white
                    placeholder-white/70

                    outline-none
                    border-none
                    ring-0

                    focus:outline-none
                    focus:ring-0

                    text-sm sm:text-base
                "
            />

            {/* BUTTON ICON */}
            <button
                onClick={handleSearch}
                className="
                    bg-orange-500
                    hover:bg-orange-600
                    transition
                    text-white
                    p-2
                    rounded-xl
                    flex items-center justify-center
                "
            >
                <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

        </div>
    );
}