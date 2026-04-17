import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [keyword, setKeyword] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        onSearch && onSearch(value);
    };

    return (
        <div className="backdrop-blur-md bg-white/20 border border-white/30 text-white px-2 py-1 rounded-lg flex items-center gap-3 shadow-lg">
            {/* ICON */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>

            {/* INPUT */}
            <input
                type="text"
                value={keyword}
                onChange={handleChange}
                placeholder="Search..."
                className="bg-transparent w-full text-white placeholder-white/70 
    outline-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-none"
            />
        </div>
    );
}
