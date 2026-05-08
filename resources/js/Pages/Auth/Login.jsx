import Checkbox from "@/Components/Checkbox";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function Login({ status, canResetPassword }) {
    // Inertia automatically handles CSRF tokens, no need to manually add _token
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({ email: "", password: "", remember: false });

    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // =========================
    // 🔥 REMEMBER EMAIL
    // =========================
    useEffect(() => {
        const savedEmail = localStorage.getItem("remember_email");
        const remember = localStorage.getItem("remember_me");

        if (savedEmail && remember === "true") {
            setData((prev) => ({
                ...prev,
                email: savedEmail,
                remember: true,
            }));
        }
    }, []);

    useEffect(() => {
        if (data.remember) {
            localStorage.setItem("remember_email", data.email);
            localStorage.setItem("remember_me", "true");
        }
    }, [data.email, data.remember]);

    // =========================
    // 🔥 TIMER SYSTEM
    // =========================
    useEffect(() => {
        const saved = localStorage.getItem("login_timer");
        if (saved) setCountdown(parseInt(saved));
    }, []);

    useEffect(() => {
        if (errors.seconds) {
            setCountdown(errors.seconds);
            localStorage.setItem("login_timer", errors.seconds);
        }
    }, [errors]);

    useEffect(() => {
        if (countdown <= 0) {
            localStorage.removeItem("login_timer");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                const val = prev - 1;
                localStorage.setItem("login_timer", val);
                return val;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (countdown === 0) clearErrors();
    }, [countdown]);

    const submit = (e) => {
        e.preventDefault();
        if (countdown > 0) return;

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Login" />
            <div className="absolute inset-0 overflow-hidden">

    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute inset-0 opacity-[0.05]"
        style={{
            backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
        }}
    ></div>

</div>

            <div className="
                min-h-screen flex items-center justify-center
                bg-black overflow-hidden relative
                px-4
            ">
                <div className="
                    relative z-10
                    w-full max-w-md
                    bg-white/10 backdrop-blur-xl
                    border border-orange-400/10
                    rounded-2xl
                    p-6 sm:p-8
                    shadow-xl
                ">

                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white">
                            WERP
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Mempermudah pencacatan dan laporan UMKM mu
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 text-green-400 text-sm text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">

                        {/* EMAIL */}
                        <div>
                            <InputLabel value="Email" />
                            <div className="relative mt-1">
                                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="email"
                                    value={data.email}
                                    className="w-full pl-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <InputLabel value="Password" />
                            <div className="relative mt-1">
                                <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />

                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-3 text-gray-400"
                                >
                                    {showPassword ? "🙈" : "👁"}
                                </button>
                            </div>

                            {(countdown > 0 || errors.password) && (
                                <div className="mt-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                                    {countdown > 0
                                        ? `Terlalu banyak percobaan login. Coba lagi dalam ${countdown} detik`
                                        : errors.password}
                                </div>
                            )}
                        </div>

                        {/* REMEMBER */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <Checkbox
                                    checked={data.remember}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setData("remember", checked);

                                        if (!checked) {
                                            localStorage.removeItem("remember_email");
                                            localStorage.removeItem("remember_me");
                                        }
                                    }}
                                />
                                <span className="ml-2 text-gray-400">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-orange-400 hover:text-orange-300"
                                >
                                    Forgot?
                                </Link>
                            )}
                        </div>

                        {/* BUTTON */}
                        <PrimaryButton
                            className="
                                w-full justify-center
                                bg-gradient-to-r from-orange-400 to-orange-500 hover:scale-[1.02]
                                text-white font-semibold
                                py-2.5 rounded-lg
                                transition
                            "
                            disabled={
                                processing ||
                                countdown > 0 ||
                                !data.password.trim()
                            }
                        >
                            {countdown > 0
                                ? `Tunggu ${countdown}s`
                                : "Login"}
                        </PrimaryButton>
                    </form>

                   {/* REGISTER */}
<div className="mt-6 text-center text-sm text-gray-400">
    <p>Belum punya akun?</p>
    <div className="flex gap-3 justify-center mt-2">
        <Link href={route('register.store')}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition">
            Daftar Toko Baru
        </Link>
        <Link href={route('register.user')}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition">
            Punya Kode Toko
        </Link>
    </div>
</div>
                </div>
            </div>
        </>
    );
}