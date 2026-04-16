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

    // 🔥 LOAD EMAIL
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

    // 🔥 SIMPAN EMAIL
    useEffect(() => {
        if (data.remember) {
            localStorage.setItem("remember_email", data.email);
            localStorage.setItem("remember_me", "true");
        }
    }, [data.email, data.remember]);

    // 🔥 LOAD TIMER
    useEffect(() => {
        const saved = localStorage.getItem("login_timer");
        if (saved) setCountdown(parseInt(saved));
    }, []);

    // 🔥 TIMER DARI BACKEND
    useEffect(() => {
        if (errors.seconds) {
            setCountdown(errors.seconds);
            localStorage.setItem("login_timer", errors.seconds);
        }
    }, [errors]);

    // 🔥 TIMER REALTIME
    useEffect(() => {
        if (countdown <= 0) {
            localStorage.removeItem("login_timer");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                const newValue = prev - 1;
                localStorage.setItem("login_timer", newValue);
                return newValue;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (countdown === 0) {
            clearErrors();
        }
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

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]">
                <div className="w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 md:grid md:grid-cols-2">
                    <div className="hidden md:flex flex-col justify-center items-center bg-[#1e293b] text-center px-10 py-16">
                        <h2 className="text-3xl font-bold text-indigo-400 mb-4">
                            Welcome Back!
                        </h2>
                        <p className="text-gray-300 text-sm mb-6">
                            Log in to access your account and manage your
                            projects.
                        </p>

                        <Link
                            href={route("register")}
                            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Create an account
                        </Link>
                    </div>
                    <div className="px-8 py-10 bg-[#020617] text-white">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Sign in to your account
                        </h2>

                        {status && (
                            <div className="mb-4 text-green-400 text-sm">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel value="Email" />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                    <TextInput
                                        type="email"
                                        value={data.email}
                                        className="mt-1 block w-full pl-10 bg-transparent border border-gray-600 text-white rounded-md focus:ring-indigo-500"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <InputLabel value="Password" />

                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />

                                    <TextInput
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={data.password}
                                        className="mt-1 block w-full pl-10 pr-10 bg-transparent border border-gray-600 text-white rounded-md focus:ring-indigo-500"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />

                                    {/* 👁 */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-2.5 text-gray-400"
                                    >
                                        {showPassword ? "🙈" : "👁"}
                                    </button>
                                </div>

                                {/* ERROR */}
                                {(countdown > 0 || errors.password) && (
                                    <div className="mt-2 text-sm text-red-400">
                                        {countdown > 0 ? (
                                            <div>
                                                Terlalu banyak percobaan login.
                                                Coba lagi dalam{" "}
                                                <b>{countdown}</b> detik
                                            </div>
                                        ) : (
                                            errors.password
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* REMEMBER */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        checked={data.remember}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setData("remember", checked);

                                            if (!checked) {
                                                localStorage.removeItem(
                                                    "remember_email",
                                                );
                                                localStorage.removeItem(
                                                    "remember_me",
                                                );
                                            }
                                        }}
                                    />
                                    <span className="ml-2 text-sm text-gray-400">
                                        Remember me
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-sm text-indigo-400 hover:text-indigo-300"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* BUTTON */}
                            <PrimaryButton
                                className="w-full justify-center items-center bg-gray-300 text-black font-semibold hover:bg-gray-400"
                                disabled={
                                    processing ||
                                    countdown > 0 ||
                                    !data.password.trim()
                                }
                            >
                                {countdown > 0
                                    ? `Tunggu ${countdown}s`
                                    : "LOG IN"}
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
