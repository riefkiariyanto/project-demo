import { Link } from "@inertiajs/react";
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
    const menu = [
        { name: "Dashboard", icon: HomeIcon },
        { name: "Kasir", icon: ShoppingCartIcon },
        { name: "Laporan", icon: ChartBarIcon },
        { name: "Kelola Toko", icon: Cog6ToothIcon },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-full z-40 bg-gradient-to-b from-orange-400 to-orange-600 text-white p-4 transition-all duration-300 ${
                open ? "w-64" : "w-20"
            }`}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                {open ? (
                    <>
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-auto text-white" />
                            <h1 className="font-bold text-lg">Warkop</h1>
                        </div>

                        <button onClick={() => setOpen(false)}>
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setOpen(true)}
                        className="w-full flex justify-center p-2 hover:bg-white/20 rounded"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* MENU */}
            <div className="space-y-3">
                {menu.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 cursor-pointer"
                    >
                        <item.icon className="h-5 w-5" />
                        {open && <span>{item.name}</span>}
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-4 w-full left-0 px-4 space-y-2">
                <Link href={route("profile.edit")}>
                    <div className="flex items-center gap-3 p-2 hover:bg-white/20 rounded">
                        <Cog6ToothIcon className="h-5 w-5" />
                        {open && "Setting"}
                    </div>
                </Link>

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 p-2 hover:bg-white/20 rounded w-full text-left"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    {open && "Logout"}
                </Link>
            </div>
        </div>
    );
}
