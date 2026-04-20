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

            {/* SIDEBAR */}
            <Sidebar open={open} setOpen={setOpen} />

            {/* CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col">


                {/* 🔥 WRAPPER YANG SAMA */}
                <div className="flex-1 min-w-0 flex flex-col">

                    {/* SEARCH */}
                    <div className="px-4 pt-4">
                        <SearchBar onSearch={setSearch} />
                    </div>

                    {/* MAIN */}
                    <main className="flex-1 overflow-hidden px-4 pt-3">
                        {children}
                    </main>

                </div>

            </div>
        </div>
    );
}