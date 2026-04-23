import Checkbox from "@/Components/Checkbox";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Login({ status, canResetPassword }) {
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

            <div className="
                min-h-screen flex items-center justify-center
                bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950
                px-4
            ">
                <div className="
                    w-full max-w-md
                    bg-white/5 backdrop-blur-xl
                    border border-white/10
                    rounded-2xl
                    p-6 sm:p-8
                    shadow-xl
                ">

                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white">
                            Welcome Back 👋
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Login untuk melanjutkan
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
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="email"
                                    value={data.email}
                                    className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />

                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    Forgot?
                                </Link>
                            )}
                        </div>

                        {/* BUTTON */}
                        <PrimaryButton
                            className="
                                w-full justify-center
                                bg-indigo-600 hover:bg-indigo-700
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
                        Belum punya akun?{" "}
                        <Link
                            href={route("register")}
                            className="text-indigo-400 font-semibold"
                        >
                            Daftar
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}