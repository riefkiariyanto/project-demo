import { useState, useRef, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function ChartPesanan() {

    // ================= STATE =================
    const [bulan, setBulan] = useState("Apr");
    const [minggu, setMinggu] = useState("Minggu 1");

    // ================= OPTIONS =================
    const bulanList = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
    const mingguList = ["Minggu ke 1", "Minggu ke 2", "Minggu ke 3", "Minggu ke 4"];

    // ================= DATA =================
    const data = [
        { day: "Sen", value: 300000 },
        { day: "Sel", value: 450000 },
        { day: "Rab", value: 280000 },
        { day: "Kam", value: 900000 },
        { day: "Jum", value: 750000 },
        { day: "Sab", value: 1200000 },
        { day: "Min", value: 1000000 },
    ];

    const formatRupiah = (val) => `${(val / 1000).toFixed(0)}k`;

    return (
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 border border-white/20 rounded-2xl p-5 h-[320px] text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">

                <h3 className="text-lg font-semibold">
                    Analisa Penjualan
                </h3>

                {/* DROPDOWN */}
                <div className="flex gap-2">
                    <Dropdown
                        options={bulanList}
                        selected={bulan}
                        setSelected={setBulan}
                    />

                    <Dropdown
                        options={mingguList}
                        selected={minggu}
                        setSelected={setMinggu}
                    />
                </div>

            </div>

            {/* CHART */}
            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="day" stroke="#ffffff" fontSize={12} />

                        <YAxis
                            stroke="#ffffff"
                            fontSize={11}
                            domain={[100000, 1500000]}
                            ticks={[
                                100000,
                                300000,
                                500000,
                                700000,
                                900000,
                                1100000,
                                1300000,
                                1500000,
                            ]}
                            tickFormatter={formatRupiah}
                        />

                        <Tooltip
                            formatter={(value) =>
                                `Rp ${value.toLocaleString("id-ID")}`
                            }
                            contentStyle={{
                                background: "#1f2937",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />

                        <Bar
                            dataKey="value"
                            fill="#f97316"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}


/* ================= DROPDOWN (STYLE RIWAYAT) ================= */

function Dropdown({ options, selected, setSelected }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>

            {/* BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition"
            >
                {selected}
                <span className={`text-[10px] transition ${open ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>

            {/* MENU */}
            {open && (
                <div className="absolute right-0 mt-2 w-32 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">

                    {options.map((item) => (
                        <div
                            key={item}
                            onClick={() => {
                                setSelected(item);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 text-xs cursor-pointer transition hover:bg-white/10 ${selected === item
                                ? "bg-white/10 text-orange-300"
                                : "text-white/70"
                                }`}
                        >
                            {item}
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}