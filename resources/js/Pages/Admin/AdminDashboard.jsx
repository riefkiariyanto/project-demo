import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

<<<<<<< HEAD
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

=======
export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-3xl font-semibold leading-tight text-white">
                    Dasbhoard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Coba lagi!!!!</div>
                    </div>
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                </div>
            </div>
        </AuthenticatedLayout>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
