import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import {
    HomeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { Link, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import SearchBar from "@/Components/SearchBar";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function AuthenticatedLayout({ header, children, openCart, hideSearch = false }) {
    const [search, setSearch] = useState("");
    const { isDark, toggle } = useDarkMode();
    const { auth, url } = usePage().props;
    const roles = auth?.roles || [];
    const currentUrl = usePage().url;

    const [open, setOpen] = useState(() => {
        try {
            if (window.innerWidth < 768) return false;
            return JSON.parse(localStorage.getItem("sidebar")) ?? true;
        } catch {
            return false;
        }
    });

    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setOpen(false);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile) localStorage.setItem("sidebar", JSON.stringify(open));
    }, [open, isMobile]);

    const getDashboardLink = () => {
        if (roles.includes("superadmin")) return "/superadmin";
        if (roles.includes("admin")) return "/admin";
        return "/dashboard";
    };

    const bottomNavItems = [
        { name: "Home", icon: HomeIcon, link: getDashboardLink(), roles: ["user", "admin", "superadmin"] },
        { name: "Kasir", icon: ShoppingCartIcon, link: "/kasir", roles: ["admin", "superadmin", "user"] },
        { name: "Laporan", icon: ChartBarIcon, link: "/laporan", roles: ["admin", "superadmin"] },
        { name: "Toko", icon: Cog6ToothIcon, link: "/kelolatoko", roles: ["admin", "superadmin"] },
    ].filter(item => item.roles.some(role => roles.includes(role)));

    const isActive = (link) => currentUrl.startsWith(link);

    return (
        <div className={`h-screen flex transition-colors duration-300 overflow-hidden
            ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-orange-400 via-orange-300 to-orange-200"}`}>

            {/* ── DESKTOP SIDEBAR ──────────────────────────────────── */}
            {!isMobile && (
                <Sidebar open={open} setOpen={setOpen} isDark={isDark} />
            )}

            {/* ── MOBILE SIDEBAR OVERLAY ───────────────────────────── */}
            {isMobile && showMobileSidebar && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setShowMobileSidebar(false)} />
                    <div className="fixed top-0 left-0 h-full z-50 w-64">
                        <Sidebar open={true} setOpen={() => setShowMobileSidebar(false)} isDark={isDark} />
                        <button
                            onClick={() => setShowMobileSidebar(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 text-white z-50">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </>
            )}

            {/* ── DESKTOP SPACER ───────────────────────────────────── */}
            {!isMobile && (
                <div className={`transition-all duration-300 shrink-0 ${open ? "w-60" : "w-20"}`} />
            )}

            {/* ── CONTENT ──────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col relative">

                {/* MOBILE TOP BAR */}
                {isMobile && (
                    <div className={`flex items-center justify-between px-4 py-3 shrink-0
                        ${isDark ? "bg-slate-900/80" : "bg-white/10"} backdrop-blur-sm border-b border-white/10`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowMobileSidebar(true)}
                                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <span className="text-white font-bold text-lg">
                                {auth?.store?.name ?? "Warkop POS"}
                            </span>
                        </div>

                        <button onClick={toggle}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
                            {isDark
                                ? <SunIcon className="w-5 h-5 text-yellow-300" />
                                : <MoonIcon className="w-5 h-5 text-white" />}
                        </button>
                    </div>
                )}

                {/* DESKTOP SEARCH */}
                {!hideSearch && !isMobile && (
                    <div className="px-4 pt-2 shrink-0">
                        <div className={`transition-all duration-300 ${openCart ? "mr-[320px]" : "mr-0"}`}>
                            <SearchBar onSearch={setSearch} isDark={isDark} />
                        </div>
                    </div>
                )}

                {/* DESKTOP DARK MODE TOGGLE */}
                {!isMobile && (
                    <div className="absolute top-3 right-4 z-30">
                        <button onClick={toggle}
                            className={`p-2 rounded-xl transition backdrop-blur-sm border
                                ${isDark
                                    ? "bg-gray-700/80 border-gray-600 hover:bg-gray-600"
                                    : "bg-white/20 border-white/30 hover:bg-white/30"}`}>
                            {isDark
                                ? <SunIcon className="w-5 h-5 text-yellow-300" />
                                : <MoonIcon className="w-5 h-5 text-white" />}
                        </button>
                    </div>
                )}

                {/* MAIN */}
                <main className={`flex-1 overflow-auto px-3 pt-3 ${isMobile ? "pb-20" : "pb-4"}`}>
                    {children}
                </main>

                {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
                {isMobile && (
                    <div className={`fixed bottom-0 left-0 right-0 z-30 border-t
                        ${isDark
                            ? "bg-slate-900 border-slate-700"
                            : "bg-white/80 border-orange-200"} backdrop-blur-xl`}>
                        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
                            {bottomNavItems.map((item, i) => {
                                const active = isActive(item.link);
                                return (
                                    <Link key={i} href={item.link}
                                        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px]">
                                        <div className={`p-1.5 rounded-xl transition-all
                                            ${active
                                                ? isDark
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-orange-500 text-white"
                                                : isDark
                                                    ? "text-slate-400"
                                                    : "text-orange-400"}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-semibold transition-all
                                            ${active
                                                ? "text-orange-500"
                                                : isDark ? "text-slate-400" : "text-orange-400"}`}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}