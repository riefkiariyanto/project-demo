import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import StockMenu from "./StockMenu";
import StockBahan from "./StockBahan";

export default function KelolaToko() {
    return (
        <AuthenticatedLayout>
            <Head title="Kelola Toko" />

            <div className="p-6 text-white">

                <h1 className="text-3xl font-bold mb-6">
                    Laporan Stock
                </h1>

                {/* GRID 2 KOLOM */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ================= LEFT : STOCK MENU ================= */}
                    <div className="space-y-4">

                        {/* SUMMARY MENU */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4">
                                <p className="text-sm text-gray-400">
                                    Total Menu
                                </p>
                                <p className="text-xl font-bold mt-1 text-orange-400">
                                    120 Item
                                </p>
                            </div>

                            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4">
                                <p className="text-sm text-gray-400">
                                    Stok Habis
                                </p>
                                <p className="text-xl font-bold mt-1 text-red-400">
                                    12 Item
                                </p>
                            </div>
                        </div>

                        {/* STOCK MENU */}
                        <StockMenu />

                    </div>

                    {/* ================= RIGHT : STOCK BAHAN ================= */}
                    <div className="space-y-4">

                        {/* SUMMARY BAHAN */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4">
                                <p className="text-sm text-gray-400">
                                    Total Bahan
                                </p>
                                <p className="text-xl font-bold mt-1 text-green-400">
                                    80 Item
                                </p>
                            </div>

                            <div className="bg-[#1f2937] border border-gray-700 rounded-2xl p-4">
                                <p className="text-sm text-gray-400">
                                    Stok Menipis
                                </p>
                                <p className="text-xl font-bold mt-1 text-yellow-400">
                                    6 Item
                                </p>
                            </div>
                        </div>

                        {/* STOCK BAHAN */}
                        <StockBahan />

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}