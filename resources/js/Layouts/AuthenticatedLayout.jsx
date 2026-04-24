import { useEffect, useState } from "react";
import Sidebar from "@/Components/Sidebar";
import SearchBar from "@/Components/SearchBar";

export default function AuthenticatedLayout({ header, children, openCart }) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("sidebar")) ?? true;
        } catch {
            return true;
        }
    });

    useEffect(() => {
        localStorage.setItem("sidebar", JSON.stringify(open));
    }, [open]);

    return (
        <div className="h-screen flex bg-gradient-to-br from-orange-400 via-orange-300 to-orange-200">

            {/* SIDEBAR (FIXED) */}
            <Sidebar open={open} setOpen={setOpen} />

            {/* 🔥 SPACER (WAJIB) */}
            <div
                className={`
                    transition-all duration-300
                    ${open ? "w-60" : "w-20"}
                `}
            />

            {/* CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col">

                {/* SEARCH */}
                <div className="px-4 pt-2">
                    <div
                        className={`transition-all duration-300 ${openCart ? "mr-[320px]" : "mr-0"
                            }`}
                    >
                        <SearchBar onSearch={setSearch} />
                    </div>
                </div>

                {/* MAIN */}
                <main className="flex-1 overflow-auto px-4 pt-3">
                    {children}
                </main>

            </div>
        </div>
    );
}