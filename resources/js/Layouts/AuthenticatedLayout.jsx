import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Sidebar from "@/Components/Sidebar";
import SearchBar from "@/Components/SearchBar";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formattedTime = time.toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-200 to-orange-400">
            {/* SIDEBAR */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* CONTENT WRAPPER */}
            <div
                className={`min-h-screen transition-all duration-300 ${
                    sidebarOpen ? "ml-64" : "ml-20"
                }`}
            >
                {/* TOP BAR (SEARCH + JAM) */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                    {/* SEARCH */}
                    <div className="w-full max-w-md">
                        <SearchBar onSearch={setSearch} />
                    </div>

                    {/* JAM (GLASS EFFECT) */}
                    <div className="backdrop-blur-md bg-white/20 border border-white/30 text-white px-5 py-2 rounded-full flex items-center gap-3 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
                            />
                        </svg>

                        <span className="text-sm font-medium">
                            {formattedTime}
                        </span>
                    </div>
                </div>

                {/* HEADER (DI BAWAH SEARCH) */}
                {header && (
                    <div className="px-6">
                        <div className="bg-white shadow rounded-xl px-6 py-4 mb-4">
                            {header}
                        </div>
                    </div>
                )}

                {/* MAIN */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
