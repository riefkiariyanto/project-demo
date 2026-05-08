import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import {
    HomeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Link, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Sidebar";
import SearchBar from "@/Components/SearchBar";
import { useDarkMode } from "@/hooks/useDarkMode";
import PageTransition from "@/Components/PageTransition";

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
                        <div className="flex items-center">
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
                <main className={`flex-1 overflow-auto px-0 pt-1 ${isMobile ? "pb-20" : "pb-4"}`}>
                    <PageTransition keyProp={currentUrl}>
                        {children}
                    </PageTransition>
                </main>

                {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
                {isMobile && (
                    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 md:hidden w-[88%] max-w-md">
                        <div className={`
                            h-16 flex items-center justify-around
                            rounded-[26px] px-2 py-2 border backdrop-blur-2xl
                            transition-all duration-300
                            ${isDark
                                ? "bg-slate-900/90 border-slate-700"
                                : "bg-white/80 border-orange-100"}
                        `}>
                            {bottomNavItems.map((item, i) => {
                                const active = isActive(item.link);
                                return (
                                    <Link
                                        key={i}
                                        href={item.link}
                                        className={`
                                            relative flex items-center justify-center
                                            w-12 h-12 rounded-full transition-all duration-300
                                            ${active
                                                ? `bg-white -translate-y-3 scale-105 ${isDark ? "shadow-[0_4px_16px_rgba(255,115,0,0.2)]" : "shadow-[0_4px_20px_rgba(255,115,0,0.35)]"}`
                                                : "bg-transparent"}
                                        `}
                                    >
                                        <div className={`
                                            flex items-center justify-center transition-all duration-300
                                            ${active
                                                ? "text-orange-500"
                                                : isDark ? "text-slate-400" : "text-orange-400"}
                                        `}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`
                                            absolute -bottom-4 text-[10px] font-semibold
                                            whitespace-nowrap transition-all duration-300
                                            ${active ? "opacity-100 text-orange-500" : "opacity-0 pointer-events-none"}
                                        `}>
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300"
                            >
                                <div className="flex items-center justify-center text-red-400">
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}