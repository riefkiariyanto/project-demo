import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [keyword, setKeyword] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        onSearch && onSearch(value);
    };

    return (
        <div className=" bg-white/30 backdrop-blur-xl rounded-2xl p-3 border border-white/30 max-h-[800px] flex flex-col">

            <input
                type="text"
                value={keyword}
                onChange={handleChange}
                placeholder="Search menu..."
                className="
                    bg-transparent
                    w-full
                    min-w-0

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
        </div>
    );
}