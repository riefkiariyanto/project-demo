import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import LogoutButton from "@/Components/LogoutButton";
import {
    HomeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    BanknotesIcon,
    BuildingStorefrontIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    SunIcon,
    MoonIcon,
} from "@heroicons/react/24/solid";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function Sidebar({ open, setOpen, isDark }) {
    const { toggle } = useDarkMode();
    const { auth } = usePage().props;
    const store = auth.store;
    const { url } = usePage();
    const roles = auth.roles || [];

    

    const getDashboardLink = () => {
        if (roles.includes("superadmin")) return "/superadmin";
        if (roles.includes("admin")) return "/admin";
        return "/dashboard";
    };

    const menus = [
        {
            name: "Dashboard",
            icon: HomeIcon,
            link: getDashboardLink(),
            roles: ["user", "admin", "superadmin"],
        },
        {
            name: "Kasir",
            icon: ShoppingCartIcon,
            link: "/kasir",
            roles: ["admin", "superadmin", "user"],
        },
        {
            name: "Laporan",
            icon: ChartBarIcon,
            link: "/laporan",
            roles: ["admin", "superadmin"],
        },
        {
            name: "Pengeluaran",
            icon: BanknotesIcon,
            link: "/pengeluaran",
            roles: ["user", "admin", "superadmin"],
        },
        {
            name: "Kelola Toko",
            icon: BuildingStorefrontIcon,
            link: "/kelolatoko",
            roles: ["superadmin", "admin"],
        },
        {
            name: 'Pengaturan',
            icon: Cog6ToothIcon,
            link: '/pengaturan',
            roles: ['user', 'admin', 'superadmin'],
        },
    ];

    const filteredMenus = menus.filter((menu) =>
        menu.roles.some((role) => roles.includes(role))
    );

    return (
        <div className={`fixed top-0 left-0 h-screen z-40 p-4
            transition-all duration-300 ease-in-out
            ${isDark
                ? "bg-slate-900 border-r border-slate-700 text-white"
                : "bg-white border-r border-gray-200 text-gray-900"}
            ${open ? "w-60" : "w-20"} flex flex-col`}>


           {/* HEADER */}
<div className="flex items-center justify-between mb-6">
    <div className={`flex items-center transition-all duration-300 ${open ? "gap-2 opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
        
        {/* Logo toko — pakai foto kalau ada, fallback initials */}
        {store?.logo ? (
            <img 
                src={`/storage/${store.logo}`} 
                alt={store.name}
                className="h-8 w-8 rounded-lg object-cover"
            />
        ) : (
            <div className="h-8 w-8 rounded-lg bg-white text-orange-500 flex items-center justify-center font-bold text-sm">
                {store?.name?.charAt(0)?.toUpperCase() ?? "W"}
            </div>
        )}

        <h1 className="font-bold text-lg whitespace-nowrap">
            {store?.name ?? "Warkop"}
        </h1>
    </div>

    <button
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-lg transition ${open ? "" : "mx-auto"} ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}
    >
        <Bars3Icon className="h-6 w-6" />
    </button>
</div>

            {/* MENU */}
            <div className="space-y-1 mt-10 flex-1 overflow-y-auto no-scrollbar">
                {filteredMenus.map((item, i) => {
                    const isActive = url.startsWith(item.link);
                    return (
                        <Link key={i} href={item.link}>
                            <div className={`relative group flex items-center rounded-lg cursor-pointer transition-all duration-300
                                ${open ? "gap-3 px-3 py-4 justify-start" : "justify-center p-3"}
                                ${isActive
                                    ? "bg-orange-500 text-white font-semibold shadow-md"
                                    : isDark ? "hover:bg-slate-700 hover:translate-x-1" : "hover:bg-orange-50 text-gray-600 hover:text-orange-600 hover:translate-x-1"}`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className={`whitespace-nowrap transition-all duration-300 ${open ? "opacity-100 ml-1" : "opacity-0 w-0 overflow-hidden"}`}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* DARK MODE TOGGLE */}
            <div className="px-2 mb-2">
                <button
                    onClick={toggle}
                    className={`w-full flex items-center rounded-xl border transition-all duration-300
                        ${isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}
                        ${open ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"}`}
                >
                    {isDark
                        ? <SunIcon className="w-5 h-5 text-yellow-300 shrink-0" />
                        : <MoonIcon className="w-5 h-5 text-gray-500 shrink-0" />}
                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"} ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                        {isDark ? "Light Mode" : "Dark Mode"}
                    </span>
                </button>
            </div>

           {/* FOOTER */}
<div className="mt-0 px-2">
    <div className={`flex items-center rounded-xl border transition-all duration-300
        ${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"}
        ${open ? "justify-between px-3 py-2" : "justify-center p-2"}`}
    >
        {open ? (
            <>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                        {auth.user.name
                            ?.split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0].toUpperCase())
                            .join("")}
                    </div>
                    <Link href={route("profile.edit")}>
                        <div className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{auth.user.name}</div>
                        <div className={`text-xs truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>{roles[0] || "-"}</div>
                    </Link>
                </div>

                <LogoutButton className={`transition ${isDark ? "text-slate-400 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </LogoutButton>
            </>
        ) : (
            <LogoutButton className={`transition flex items-center justify-center ${isDark ? "text-slate-400 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </LogoutButton>
        )}
    </div>
</div>
        </div>
    );
}