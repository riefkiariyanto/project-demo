export default function TotalPesanan({
    title = "Total Income",
    value = "$0",
    growth = "+0%",
    label = "Today"
}) {
    return (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5">

            {/* HEADER */}
            <div className="flex justify-between mb-3">
                <h3 className="text-sm text-white/70">
                    {title}
                </h3>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                    {label}
                </span>
            </div>

            {/* VALUE */}
            <div className="flex justify-between items-end">
                <span className="text-2xl font-bold">
                    {value}
                </span>

                <span
                    className={`font-semibold text-sm ${growth.includes("-")
                        ? "text-red-400"
                        : "text-green-400"
                        }`}
                >
                    {growth}
                </span>
            </div>

        </div>
    );
}