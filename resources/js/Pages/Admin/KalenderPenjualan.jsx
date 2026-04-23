import { useState, useRef, useEffect } from "react";

export default function KalenderPenjualan() {

    // ================= STATE =================
    const today = new Date();

    const [month, setMonth] = useState(today.getMonth()); // 0-11
    const [year, setYear] = useState(today.getFullYear());
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    const months = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ];

    const daysName = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

    // ================= CLOSE DROPDOWN =================
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ================= DATA DUMMY =================
    const data = [
        { day: 1, total: 5 },
        { day: 2, total: 10 },
        { day: 5, total: 20 },
        { day: 10, total: 15 },
        { day: 15, total: 25 },
        { day: 20, total: 7 },
        { day: 25, total: 18 },
    ];

    const getValue = (day) => {
        const found = data.find(d => d.day === day);
        return found ? found.total : 0;
    };

    // ================= WARNA =================
    const getColor = (value) => {
        if (value === 0) return "bg-white/5 text-white/30";
        if (value < 5) return "bg-orange-200 text-black";
        if (value < 10) return "bg-orange-400 text-white";
        if (value < 20) return "bg-orange-500 text-white";
        return "bg-orange-600 text-white";
    };

    // ================= LOGIC KALENDER =================

    // total hari dalam bulan
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // hari pertama bulan (0=minggu, kita ubah ke senin)
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // convert ke senin start

    // total cell (biar full grid)
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const calendar = Array.from({ length: totalCells });

    return (
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-5">
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">

                <div>
                    <p className="text-xs text-white/60">Time order</p>
                    <h3 className="font-semibold">Kalender Penjualan</h3>
                    <p className="text-green-400 text-xl font-bold">+2.6%</p>
                </div>

                {/* DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20"
                    >
                        {months[month]} {year}
                        <span className={`text-[10px] ${open ? "rotate-180" : ""}`}>
                            ▼
                        </span>
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-2 w-40 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                            {months.map((m, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        setMonth(i);
                                        setOpen(false);
                                    }}
                                    className="px-3 py-2 text-xs hover:bg-white/10 cursor-pointer"
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* HARI */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-white/50">
                {daysName.map((d) => (
                    <div key={d} className="text-center">
                        {d}
                    </div>
                ))}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-7 gap-2">
                {calendar.map((_, i) => {
                    const day = i - firstDay + 1;

                    if (i < firstDay || day > daysInMonth) {
                        return <div key={i}></div>;
                    }

                    const value = getValue(day);

                    return (
                        <div
                            key={i}
                            className={`h-10 text-xs flex flex-col items-center justify-center rounded transition hover:scale-105 ${getColor(value)}`}
                        >
                            <span>{day}</span>
                            <span className="text-[9px] opacity-70">
                                {value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* LEGEND */}
            <div className="flex justify-between items-center mt-4 text-[10px] text-white/40">
                <span>Sedikit</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white/10 rounded"></div>
                    <div className="w-3 h-3 bg-orange-200 rounded"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded"></div>
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <div className="w-3 h-3 bg-orange-600 rounded"></div>
                </div>
                <span>Banyak</span>
            </div>

            {/* BUTTON */}
            <button className="mt-4 w-full text-xs bg-white/20 px-3 py-2 rounded hover:bg-white/30 transition">
                Create Report
            </button>

        </div>
    );
}