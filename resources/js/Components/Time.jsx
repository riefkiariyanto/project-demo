import { useEffect, useState } from "react";

export default function Time() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formattedTime = time.toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="
            backdrop-blur-md
            bg-white/20
            border border-white/30
            text-white
            px-3 py-2
            rounded-lg
            flex items-center
            gap-2
            shadow-lg
            w-full
            min-w-0
            flex-1
        ">
            {formattedTime}
        </div>
    );
}