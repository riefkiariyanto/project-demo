import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

import MostOrder from "./MostOrder";
import KalenderPenjualan from "./KalenderPenjualan";
import ChartPesanan from "./ChartPesanan";
import RiwayatPesanan from "./RiwayatPesanan";
import TotalPendapatan from "./TotalPendapatan";
import TotalPesanan from "./TotalPesanan";
import TotalPengeluaran from "./TotalPengeluaran";

export default function Laporan() {
    const orders = [
        { name: "Nasi goreng", price: 200, total: 43, growth: "18%" },
        { name: "Mie goreng", price: 220, total: 26, growth: "12%" },
        { name: "Nasi campur", price: 22, total: 12, growth: "9%" },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Point of Sales" />

            <div className="p-6 text-white">

                {/* SPLIT */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ================= LEFT ================= */}
                    <div className="flex-1 space-y-6">

                        {/* HEADER */}
                        <div className="space-y-0">
                            <h1 className="text-4xl font-bold">
                                Point Of Sales
                            </h1>
                            <h1 className="text-4xl font-bold">
                                Overview
                            </h1>
                        </div>
                        {/* TOP SUMMARY */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <TotalPendapatan
                                title="Total Income"
                                value="$3,630"
                                growth="+3.7%"
                            />

                            <TotalPesanan
                                title="Total Sales"
                                value="76"
                                growth="+2.6%"
                            />

                            <TotalPengeluaran
                                title="Total Orders"
                                value="120"
                                growth="+5.1%"
                            />

                        </div>

                        {/* MIDDLE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <MostOrder orders={orders} />

                            <ChartPesanan />

                        </div>

                    </div>

                    {/* ================= RIGHT ================= */}
                    <div className="w-full lg:w-[380px] space-y-6">

                        <KalenderPenjualan />

                        <RiwayatPesanan />

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}