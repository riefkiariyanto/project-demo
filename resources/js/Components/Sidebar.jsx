import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    HomeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
} from "@heroicons/react/24/solid";

export default function Sidebar({ open, setOpen }) {
    const { auth } = usePage().props;
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
            name: "Kelola Toko",
            icon: Cog6ToothIcon,
            link: "/kelolatoko",
            roles: ["superadmin", "admin"],
        },
    ];

    const filteredMenus = menus.filter((menu) =>
        menu.roles.some((role) => roles.includes(role))
    );

    return (
        <div
            className={`
                fixed top-0 left-0
                h-screen
                z-40
                bg-gradient-to-b from-orange-400 to-orange-500
                text-white p-4
                transition-all duration-300 ease-in-out rounded-r-[30px]
                ${open ? "w-60" : "w-20"}
                flex flex-col
            `}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div
                    className={`flex items-center transition-all duration-300 ${open ? "gap-2 opacity-100" : "opacity-0 w-0 overflow-hidden"
                        }`}
                >
                    <ApplicationLogo className="h-8 w-auto text-white" />
                    <h1 className="font-bold text-lg whitespace-nowrap">
                        Warkop
                    </h1>
                </div>

                <button
                    onClick={() => setOpen(!open)}
                    className={`p-2 rounded-lg hover:bg-white/20 transition ${open ? "" : "mx-auto"
                        }`}
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
                            <div
                                className={`relative group flex items-center rounded-lg cursor-pointer transition-all duration-300 ${open
                                    ? "gap-3 px-3 py-4 justify-start"
                                    : "justify-center p-3"
                                    } ${isActive
                                        ? "bg-white text-orange-500 font-semibold"
                                        : "hover:bg-white/20"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span
                                    className={`whitespace-nowrap transition-all duration-300 ${open
                                        ? "opacity-100 ml-1"
                                        : "opacity-0 w-0 overflow-hidden"
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* FOOTER */}
            <div className="mt-4 px-2">
                <div
                    className={`
                        flex items-center
                        rounded-xl bg-white/20 backdrop-blur-md border border-white/30
                        transition-all duration-300
                        ${open ? "justify-between px-3 py-2" : "justify-center p-2"}
                    `}
                >
                    {open ? (
                        <>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold">
                                    {auth.user.name
                                        ?.split(" ")
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((w) => w[0].toUpperCase())
                                        .join("")}
                                </div>

                                <Link href={route("profile.edit")}>
                                    <div className="text-sm font-semibold text-white truncate">
                                        {auth.user.name}
                                    </div>
                                    <div className="text-xs text-white/70 truncate">
                                        {roles[0] || "-"}
                                    </div>
                                </Link>
                            </div>

                            <Link
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="text-white hover:text-red-300 transition"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            </Link>
                        </>
                    ) : (
                        <Link
                            method="post"
                            href={route("logout")}
                            as="button"
                            className="text-white hover:text-red-300 transition flex items-center justify-center"
                        >
                            <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}